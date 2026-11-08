ALTER TABLE blog_posts ADD COLUMN content_bn TEXT;
ALTER TABLE blog_posts ADD COLUMN summary_en VARCHAR(300);
ALTER TABLE blog_posts ADD COLUMN summary_bn VARCHAR(300);

INSERT INTO blog_posts (slug, title_en, title_bn, summary_en, summary_bn, content, content_bn, published) VALUES
                                                                                                              (
                                                                                                                  $$who-can-donate-blood$$,
                                                                                                                  $$Who can donate blood?$$,
                                                                                                                  $$কারা রক্ত দিতে পারেন?$$,
                                                                                                                  $$Check if you are eligible before you donate.$$,
                                                                                                                  $$রক্তদানের আগে জেনে নিন আপনি যোগ্য কিনা।$$,
                                                                                                                  $$Blood donation is safe for most healthy adults. The points below are general guidelines. The doctor at the blood center makes the final decision on the day.
You can usually donate if you:
- are between 18 and 60 years old
- weigh at least 50 kg
- feel healthy and have no fever, cold or infection
                                                                                                                  - have a haemoglobin level that meets the center's minimum (it is checked before donation)
Please do not donate, or ask the doctor first, if you:
- are pregnant or breastfeeding
- have had a recent surgery, tattoo or piercing
- have a long-term illness such as heart disease or uncontrolled diabetes
- have donated blood within the last 3 months
Wait at least 3 months (90 days) between whole blood donations. Blood Bangladesh shows donors as Unavailable during this period.$$,
$$সুস্থ প্রাপ্তবয়স্ক বেশিরভাগ মানুষের জন্য রক্তদান নিরাপদ। নিচের তথ্য সাধারণ নির্দেশনা। রক্তদানের দিন ব্লাড সেন্টারের ডাক্তার চূড়ান্ত সিদ্ধান্ত নেন।
সাধারণত আপনি রক্ত দিতে পারবেন যদি:
- আপনার বয়স ১৮ থেকে ৬০ বছরের মধ্যে
- ওজন কমপক্ষে ৫০ কেজি
- নিজেকে সুস্থ মনে হয়, জ্বর, সর্দি বা সংক্রমণ নেই
- হিমোগ্লোবিন ব্লাড সেন্টারের ন্যূনতম মান পূরণ করে (রক্তদানের আগে পরীক্ষা হয়)
এই অবস্থায় রক্ত দেবেন না, অথবা আগে ডাক্তারকে জিজ্ঞেস করুন:
- গর্ভবতী বা বুকের দুধ খাওয়াচ্ছেন
- সম্প্রতি অস্ত্রোপচার, ট্যাটু বা কান-নাক ফোঁড়ানো হয়েছে
- হৃদরোগ বা অনিয়ন্ত্রিত ডায়াবেটিসের মতো দীর্ঘমেয়াদি রোগ আছে
- গত ৩ মাসের মধ্যে রক্ত দিয়েছেন
পরপর দুইবার রক্তদানের মধ্যে কমপক্ষে ৩ মাস (৯০ দিন) অপেক্ষা করুন। এই সময়ে ব্লাড বাংলাদেশ দাতাকে "অনুপলব্ধ" দেখায়।$$,
TRUE
),
(
$$before-and-after-donation$$,
$$Before and after donating blood$$,
$$রক্তদানের আগে ও পরে করণীয়$$,
$$Simple steps to stay comfortable and safe.$$,
$$সুস্থ ও স্বস্তিতে থাকার সহজ কিছু নিয়ম।$$,
$$Before you donate:
- Eat a healthy meal 2 to 3 hours before and avoid very fatty food
- Drink plenty of water
- Sleep well the night before
- Bring a valid ID
After you donate:
- Rest for 10 to 15 minutes and drink fluids
- Keep the bandage on for a few hours
- Avoid heavy lifting and hard exercise for the rest of the day
- If you feel dizzy, lie down and raise your legs
Contact a doctor if you get a fever, if your arm swells and gets worse, or if you feel unwell in the following days.$$,
$$রক্ত দেওয়ার আগে:
- ২ থেকে ৩ ঘণ্টা আগে পুষ্টিকর খাবার খান, খুব তেলেভাজা খাবার এড়িয়ে চলুন
- প্রচুর পানি পান করুন
- আগের রাতে ভালো ঘুমান
- একটি বৈধ পরিচয়পত্র সাথে রাখুন
রক্ত দেওয়ার পরে:
- ১০ থেকে ১৫ মিনিট বিশ্রাম নিন এবং তরল খান
- ব্যান্ডেজ কয়েক ঘণ্টা রাখুন
- সারাদিন ভারী জিনিস তোলা ও কঠিন ব্যায়াম এড়িয়ে চলুন
- মাথা ঘুরলে শুয়ে পড়ুন এবং পা উঁচু করে রাখুন
পরের দিনগুলোতে জ্বর এলে, হাত ফুলে গিয়ে বাড়তে থাকলে বা অসুস্থ লাগলে ডাক্তারের সাথে যোগাযোগ করুন।$$,
TRUE
),
(
$$why-donate-blood$$,
$$Why donate blood?$$,
$$কেন রক্ত দেবেন?$$,
$$One donation can make a real difference to someone's life.$$,
                                                                                                                  $$আপনার একবারের রক্তদান কারো জীবন বদলে দিতে পারে।$$,
                                                                                                                  $$Your blood can save lives:
- Blood is needed for accidents, surgery, childbirth, thalassaemia, cancer treatment and more
- One donation can help more than one patient because blood is separated into components
- There is no substitute for human blood, it can only come from donors
What you get:
- A quick free check of blood pressure, pulse and haemoglobin before donating
- The satisfaction of helping someone in need
A common myth:
- Healthy donors do not become weak. The body replaces the fluid within about a day and the red cells within a few weeks$$,
                                                                                                                  $$আপনার রক্ত জীবন বাঁচাতে পারে:
                                                                                                                  - দুর্ঘটনা, অস্ত্রোপচার, সন্তান প্রসব, থ্যালাসেমিয়া, ক্যানসার চিকিৎসা ইত্যাদিতে রক্ত লাগে
                                                                                                                  - রক্ত বিভিন্ন উপাদানে ভাগ করা যায়, তাই একবারের দানে একাধিক রোগীর উপকার হতে পারে
                                                                                                                  - মানুষের রক্তের কোনো বিকল্প নেই, এটি শুধু দাতার কাছ থেকেই আসে
                                                                                                                  আপনি যা পান:
                                                                                                                  - রক্ত দেওয়ার আগে রক্তচাপ, নাড়ি ও হিমোগ্লোবিনের বিনামূল্যে দ্রুত পরীক্ষা
                                                                                                                  - অন্যের পাশে দাঁড়ানোর তৃপ্তি
                                                                                                                  একটি প্রচলিত ভুল ধারণা:
                                                                                                                  - সুস্থ দাতা দুর্বল হয়ে পড়েন না। শরীর প্রায় একদিনে তরল অংশ এবং কয়েক সপ্তাহে লোহিত কণিকা পূরণ করে নেয়$$,
                                                                                                                  TRUE
                                                                                                              ),
                                                                                                              (
                                                                                                                  $$blood-group-compatibility$$,
                                                                                                                  $$Blood group compatibility$$,
                                                                                                                  $$রক্তের গ্রুপ কে কাকে দিতে পারে$$,
                                                                                                                  $$Which blood groups can give to which (red blood cells).$$,
                                                                                                                  $$কোন গ্রুপের রক্ত কোন গ্রুপের রোগীকে দেওয়া যায় (লোহিত কণিকা)।$$,
                                                                                                                  $$Red blood cell compatibility, donor to patient:
- O-: can give to all groups (universal donor)
- O+: O+, A+, B+, AB+
                  - A-: A-, A+, AB-, AB+
                                     - A+: A+, AB+
                                               - B-: B-, B+, AB-, AB+
                                                                  - B+: B+, AB+
                                                                            - AB-: AB-, AB+
                                                                                        - AB+: AB+ only, but can receive from all groups
Always ask for the patient's exact blood group when you can. The hospital lab will also do a cross-match test before transfusion.$$,
$$লোহিত কণিকার সামঞ্জস্য, দাতা থেকে রোগী:
- O-: সব গ্রুপকে দিতে পারে (সর্বজনীন দাতা)
- O+: O+, A+, B+, AB+
- A-: A-, A+, AB-, AB+
- A+: A+, AB+
- B-: B-, B+, AB-, AB+
- B+: B+, AB+
- AB-: AB-, AB+
- AB+: শুধু AB+ কে দিতে পারে, কিন্তু সব গ্রুপ থেকে নিতে পারে
সম্ভব হলে রোগীর সঠিক রক্তের গ্রুপ জেনে নিন। রক্ত দেওয়ার আগে হাসপাতালের ল্যাবে ক্রসম্যাচ পরীক্ষাও হয়।$$,
TRUE
);