-- ============ LOCATIONS ============
CREATE TABLE divisions (
                           id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                           name_en VARCHAR(60) NOT NULL UNIQUE,
                           name_bn VARCHAR(60) NOT NULL
);

CREATE TABLE districts (
                           id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                           division_id INT NOT NULL REFERENCES divisions(id),
                           name_en     VARCHAR(60) NOT NULL,
                           name_bn     VARCHAR(60) NOT NULL,
                           UNIQUE (division_id, name_en)
);

CREATE TABLE upazilas (
                          id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                          district_id INT NOT NULL REFERENCES districts(id),
                          name_en     VARCHAR(80) NOT NULL,
                          name_bn     VARCHAR(80) NOT NULL,
                          UNIQUE (district_id, name_en)
);

-- ============ USERS ============
CREATE TABLE users (
                       id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       full_name           VARCHAR(120) NOT NULL,
                       email               VARCHAR(160) UNIQUE,
                       phone               VARCHAR(20)  UNIQUE,
                       password_hash       VARCHAR(100),
                       provider            VARCHAR(20)  NOT NULL DEFAULT 'LOCAL',
                       provider_id         VARCHAR(100),
                       role                VARCHAR(20)  NOT NULL DEFAULT 'ROLE_USER',
                       profile_picture_url VARCHAR(500),
                       phone_verified      BOOLEAN NOT NULL DEFAULT FALSE,
                       email_verified      BOOLEAN NOT NULL DEFAULT FALSE,
                       enabled             BOOLEAN NOT NULL DEFAULT TRUE,
                       created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
                       updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
                       CONSTRAINT chk_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE donor_profiles (
                                id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                                blood_group        VARCHAR(10) NOT NULL,
                                division_id        INT REFERENCES divisions(id),
                                district_id        INT REFERENCES districts(id),
                                upazila_id         INT REFERENCES upazilas(id),
                                address_detail     VARCHAR(255),
                                interested         BOOLEAN NOT NULL DEFAULT TRUE,
                                verified_by_admin  BOOLEAN NOT NULL DEFAULT FALSE,
                                last_donation_date DATE,
                                total_donations    INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_donor_search
    ON donor_profiles (blood_group, upazila_id, interested);
CREATE INDEX idx_donor_district
    ON donor_profiles (blood_group, district_id, interested);

-- ============ REQUESTS & DONATIONS ============
CREATE TABLE blood_requests (
                                id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                requester_id   UUID NOT NULL REFERENCES users(id),
                                patient_name   VARCHAR(120) NOT NULL,
                                blood_group    VARCHAR(10)  NOT NULL,
                                units_needed   INT NOT NULL DEFAULT 1,
                                hospital_name  VARCHAR(160) NOT NULL,
                                district_id    INT REFERENCES districts(id),
                                upazila_id     INT REFERENCES upazilas(id),
                                contact_number VARCHAR(20)  NOT NULL,
                                needed_at      TIMESTAMPTZ  NOT NULL,
                                note           VARCHAR(1000),
                                urgent         BOOLEAN NOT NULL DEFAULT FALSE,
                                status         VARCHAR(30)  NOT NULL DEFAULT 'OPEN',
                                created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_req_status_time ON blood_requests (status, needed_at);
CREATE INDEX idx_req_group_district ON blood_requests (blood_group, district_id);

CREATE TABLE donation_history (
                                  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  donor_id               UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
                                  request_id             UUID REFERENCES blood_requests(id) ON DELETE SET NULL,
                                  donation_date          DATE NOT NULL,
                                  hospital_name          VARCHAR(160),
                                  notes                  VARCHAR(500),
                                  confirmed_by_requester BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_donation_donor ON donation_history (donor_id, donation_date DESC);

-- ============ MESSAGES & NOTIFICATIONS ============
CREATE TABLE direct_messages (
                                 id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 sender_id        UUID NOT NULL REFERENCES users(id),
                                 donor_id         UUID NOT NULL REFERENCES users(id),
                                 blood_request_id UUID REFERENCES blood_requests(id) ON DELETE SET NULL,
                                 body             VARCHAR(1000) NOT NULL,
                                 email_sent       BOOLEAN NOT NULL DEFAULT FALSE,
                                 sms_sent         BOOLEAN NOT NULL DEFAULT FALSE,
                                 created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_msg_sender_time ON direct_messages (sender_id, created_at DESC);

CREATE TABLE notifications (
                               id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                               type       VARCHAR(40) NOT NULL,
                               payload    JSONB,
                               is_read    BOOLEAN NOT NULL DEFAULT FALSE,
                               created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_user ON notifications (user_id, is_read, created_at DESC);

-- ============ BADGES ============
CREATE TABLE badges (
                        id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                        code          VARCHAR(40) NOT NULL UNIQUE,
                        name_en       VARCHAR(60) NOT NULL,
                        name_bn       VARCHAR(60) NOT NULL,
                        min_donations INT NOT NULL,
                        icon          VARCHAR(40)
);

CREATE TABLE user_badges (
                             user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                             badge_id   INT  NOT NULL REFERENCES badges(id),
                             awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                             PRIMARY KEY (user_id, badge_id)
);

-- ============ AUTH SUPPORT ============
CREATE TABLE otp_tokens (
                            id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            phone      VARCHAR(20) NOT NULL,
                            code_hash  VARCHAR(100) NOT NULL,
                            attempts   INT NOT NULL DEFAULT 0,
                            expires_at TIMESTAMPTZ NOT NULL,
                            used       BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_otp_phone ON otp_tokens (phone, expires_at DESC);

CREATE TABLE refresh_tokens (
                                id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                token_hash VARCHAR(100) NOT NULL UNIQUE,
                                expires_at TIMESTAMPTZ NOT NULL,
                                revoked    BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============ BLOG ============
CREATE TABLE blog_posts (
                            id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            slug       VARCHAR(160) NOT NULL UNIQUE,
                            title_en   VARCHAR(200) NOT NULL,
                            title_bn   VARCHAR(200),
                            content    TEXT NOT NULL,
                            cover_url  VARCHAR(500),
                            author_id  UUID REFERENCES users(id),
                            published  BOOLEAN NOT NULL DEFAULT FALSE,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ SEED: BADGES ============
INSERT INTO badges (code, name_en, name_bn, min_donations, icon) VALUES
                                                                     ('FIRST_DROP',   'First Drop',   'প্রথম ফোঁটা',   1,  'droplet'),
                                                                     ('REGULAR_HERO', 'Regular Hero', 'নিয়মিত হিরো',   5,  'heart'),
                                                                     ('LIFE_SAVER',   'Life Saver',   'জীবন রক্ষাকারী', 10, 'shield');

-- ============ SEED: DIVISIONS ============
INSERT INTO divisions (name_en, name_bn) VALUES
                                             ('Barishal','বরিশাল'), ('Chattogram','চট্টগ্রাম'), ('Dhaka','ঢাকা'),
                                             ('Khulna','খুলনা'), ('Mymensingh','ময়মনসিংহ'), ('Rajshahi','রাজশাহী'),
                                             ('Rangpur','রংপুর'), ('Sylhet','সিলেট');

-- ============ SEED: DISTRICTS (64) ============
INSERT INTO districts (division_id, name_en, name_bn)
SELECT d.id, v.name_en, v.name_bn
FROM (VALUES
          ('Barishal','Barguna','বরগুনা'), ('Barishal','Barishal','বরিশাল'),
          ('Barishal','Bhola','ভোলা'), ('Barishal','Jhalokati','ঝালকাঠি'),
          ('Barishal','Patuakhali','পটুয়াখালী'), ('Barishal','Pirojpur','পিরোজপুর'),

          ('Chattogram','Bandarban','বান্দরবান'), ('Chattogram','Brahmanbaria','ব্রাহ্মণবাড়িয়া'),
          ('Chattogram','Chandpur','চাঁদপুর'), ('Chattogram','Chattogram','চট্টগ্রাম'),
          ('Chattogram','Cumilla','কুমিল্লা'), ('Chattogram','Cox''s Bazar','কক্সবাজার'),
          ('Chattogram','Feni','ফেনী'), ('Chattogram','Khagrachhari','খাগড়াছড়ি'),
          ('Chattogram','Lakshmipur','লক্ষ্মীপুর'), ('Chattogram','Noakhali','নোয়াখালী'),
          ('Chattogram','Rangamati','রাঙামাটি'),

          ('Dhaka','Dhaka','ঢাকা'), ('Dhaka','Faridpur','ফরিদপুর'),
          ('Dhaka','Gazipur','গাজীপুর'), ('Dhaka','Gopalganj','গোপালগঞ্জ'),
          ('Dhaka','Kishoreganj','কিশোরগঞ্জ'), ('Dhaka','Madaripur','মাদারীপুর'),
          ('Dhaka','Manikganj','মানিকগঞ্জ'), ('Dhaka','Munshiganj','মুন্সিগঞ্জ'),
          ('Dhaka','Narayanganj','নারায়ণগঞ্জ'), ('Dhaka','Narsingdi','নরসিংদী'),
          ('Dhaka','Rajbari','রাজবাড়ী'), ('Dhaka','Shariatpur','শরীয়তপুর'),
          ('Dhaka','Tangail','টাঙ্গাইল'),

          ('Khulna','Bagerhat','বাগেরহাট'), ('Khulna','Chuadanga','চুয়াডাঙ্গা'),
          ('Khulna','Jashore','যশোর'), ('Khulna','Jhenaidah','ঝিনাইদহ'),
          ('Khulna','Khulna','খুলনা'), ('Khulna','Kushtia','কুষ্টিয়া'),
          ('Khulna','Magura','মাগুরা'), ('Khulna','Meherpur','মেহেরপুর'),
          ('Khulna','Narail','নড়াইল'), ('Khulna','Satkhira','সাতক্ষীরা'),

          ('Mymensingh','Jamalpur','জামালপুর'), ('Mymensingh','Mymensingh','ময়মনসিংহ'),
          ('Mymensingh','Netrokona','নেত্রকোনা'), ('Mymensingh','Sherpur','শেরপুর'),

          ('Rajshahi','Bogura','বগুড়া'), ('Rajshahi','Joypurhat','জয়পুরহাট'),
          ('Rajshahi','Naogaon','নওগাঁ'), ('Rajshahi','Natore','নাটোর'),
          ('Rajshahi','Chapainawabganj','চাঁপাইনবাবগঞ্জ'), ('Rajshahi','Pabna','পাবনা'),
          ('Rajshahi','Rajshahi','রাজশাহী'), ('Rajshahi','Sirajganj','সিরাজগঞ্জ'),

          ('Rangpur','Dinajpur','দিনাজপুর'), ('Rangpur','Gaibandha','গাইবান্ধা'),
          ('Rangpur','Kurigram','কুড়িগ্রাম'), ('Rangpur','Lalmonirhat','লালমনিরহাট'),
          ('Rangpur','Nilphamari','নীলফামারী'), ('Rangpur','Panchagarh','পঞ্চগড়'),
          ('Rangpur','Rangpur','রংপুর'), ('Rangpur','Thakurgaon','ঠাকুরগাঁও'),

          ('Sylhet','Habiganj','হবিগঞ্জ'), ('Sylhet','Moulvibazar','মৌলভীবাজার'),
          ('Sylhet','Sunamganj','সুনামগঞ্জ'), ('Sylhet','Sylhet','সিলেট')
     ) AS v(div_en, name_en, name_bn)
         JOIN divisions d ON d.name_en = v.div_en;

-- ============ SEED: UPAZILAS (পরীক্ষার জন্য নমুনা, পুরো তালিকা পরে) ============
INSERT INTO upazilas (district_id, name_en, name_bn)
SELECT di.id, v.name_en, v.name_bn
FROM (VALUES
          ('Sirajganj','Sirajganj Sadar','সিরাজগঞ্জ সদর'),
          ('Sirajganj','Shahzadpur','শাহজাদপুর'),
          ('Sirajganj','Ullapara','উল্লাপাড়া'),
          ('Sirajganj','Kazipur','কাজীপুর'),
          ('Sirajganj','Belkuchi','বেলকুচি'),
          ('Sirajganj','Chauhali','চৌহালি'),
          ('Sirajganj','Kamarkhanda','কামারখন্দ'),
          ('Sirajganj','Raiganj','রায়গঞ্জ'),
          ('Sirajganj','Tarash','তাড়াশ'),
          ('Dhaka','Savar','সাভার'),
          ('Dhaka','Dhamrai','ধামরাই'),
          ('Dhaka','Keraniganj','কেরানীগঞ্জ'),
          ('Dhaka','Dohar','দোহার'),
          ('Dhaka','Nawabganj','নবাবগঞ্জ')
     ) AS v(dist_en, name_en, name_bn)
         JOIN districts di ON di.name_en = v.dist_en;