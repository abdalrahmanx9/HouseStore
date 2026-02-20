import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://storeweb_user:storeweb_password@localhost:5433/storeweb_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

products_data = [
    {
        "id": 11,
        "name": "EA Sports FC 26",
        "description": '# EA Sports FC 26 - حساب ستيم كامل\n\nهتستلم حساب ستيم (Steam Account) خاص بيك واللعبة موجودة عليه كهدية (Gift). الحساب جديد تماماً (Fresh Account) مع صلاحيات دخول كاملة.\n\n## مميزات المنتج\n\n* **الملكية الكاملة:** هيوصلك بيانات الدخول الكاملة لحساب ستيم وللإيميل المربوط بيه، وتقدر تغير البيانات لبياناتك الشخصية.\n* **حالة الحساب:** حساب جديد (0 ساعات لعب) ومفهوش أي حظر سابق (No Bans).\n* **اللعب:** تقدر تلعب أونلاين وأوفلاين وتوصل لكل تحديثات اللعبة.\n\n## ملاحظات هامة قبل الشراء\n\n* حسابات ستيم بتيجي بريجون (دولة) عشوائي.\n* بعض الميزات زي "إضافة أصدقاء" (Add Friends) ممكن تكون مقفولة في البداية (لكن عادي الناس تقدر تعملك إضافة وتلعب معاهم).\n* التسليم فوري وتلقائي.',
        "price": 689,
        "category": "Games",
        "subcategory": "Sports",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 8,
        "name": "Udemy Course Gift",
        "description": "- شراء اي كورس يوديمي بيجيلك جيفت على حسابك \n- ابعت لينك الكورس في التيكيت وهقولك السعر",
        "price": 0,
        "category": "Education",
        "subcategory": "Udemy",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 13,
        "name": "Adobe Creative Cloud",
        "description": "## Adobe Creative Cloud Pro 4 Months\nحساب **شخصي**\n### المميزات:\n- فتح جميع ميزات **Creative Cloud Pro** بالكامل  \n- إضافة **4,000 رصيد AI شهريًا**  \n- الاستخدام على **جهاز واحد فقط **  \n\n### قائمة التطبيقات:\n- Photoshop  \n- Lightroom / Lightroom Classic  \n- Illustrator  \n- InDesign  \n- Premiere Pro  \n- After Effects  \n- Audition  \n- Adobe Express  \n- Adobe Media Encoder  \n\n* بالإضافة إلى أدوات أخرى مثل\n* Dreamweaver, XD, Character Animator, Dimension / Aero",
        "price": 219,
        "category": "Software",
        "subcategory": "Design & Media",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 6,
        "name": "Discord Nitro",
        "description": "# Discord Nitro 3 month link\n- لينك تفعيل هتحتاج فيزا تضيفها في الدسكورد عشان تقدر تفعله\n- لازم عُمر حسابك يكون أكبر من شهر\n- لازم تكون مفعلتش نيترو قبل كدا او مفعلتش من سنة",
        "price": 29,
        "category": "Social Media",
        "subcategory": "Discord",
        "delivery_type": "auto",
        "is_active": True,
    },
    {
        "id": 20,
        "name": "General Support",
        "description": "Ticket for general inquiries or custom orders.",
        "price": 0,
        "category": "System",
        "subcategory": None,
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 30,
        "name": "Canva Pro 1 Year",
        "description": "# Canva Pro (Edu) - اشتراك سنة كاملة (Global)\n\nهتحصل على اشتراك Canva Pro (النسخة التعليمية Edu) لمدة 12 شهر. استمتع بكل مميزات البرو وضمان كامل للمدة.\n\n## مميزات الاشتراك\n\n* **نوع الحساب:** انضمام لفريق تعليمي (Edu Team) بصلاحيات البرو (Pro Features).\n* **المدة:** ضمان سنة كاملة (12 شهر) بدون انقطاع.\n* **الاستقرار:** مش هتحتاج تغير التيم كل شهر زي الاشتراكات المجانية، التيم ثابت.\n* **الخصوصية:** كل مشاريعك وتصميماتك خاصة بيك 100% (Private)، ومحدش في التيم يقدر يشوفها غيرك.\n* **التوافق:** شغال على الكمبيوتر، الموبايل، والتابلت.\n\n## بخصوص أدوات الذكاء الاصطناعي (AI)\n\n* **شغال:** أدوات تعديل الصور بالذكاء الاصطناعي (Magic Edit, Background Remover, etc).\n* **غير مدعوم:** أدوات توليد الفيديو بالذكاء الاصطناعي (Video AI)\n\n## ملاحظات هامة\n\n* التفعيل بيتم عن طريق إيميلك الشخصي (مش بنحتاج الباسورد).",
        "price": 59,
        "category": "Software",
        "subcategory": "Design & Media",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 27,
        "name": "Telegram Premium 3 Month",
        "description": "## Telegram Premium 3 Months\n\nتفعيل **رسمي** على حسابك الشخصي\n\n### المميزات:\n\n* رفع حجم الملفات إلى **4 جيجابايت** للملف الواحد\n* **سرعة تحميل مضاعفة** للملفات والوسائط\n* تحويل **الرسائل الصوتية إلى نص** مكتوب تلقائياً\n* طقم **ملصقات مميزة** وتفاعلات فريدة حصرياً\n* شارة **النجمة الزرقاء** بجانب اسمك الشخصي\n* إيقاف **الإعلانات** تماماً في القنوات العامة\n\n### خصائص إضافية:\n\n* إدارة متقدمة للمحادثات والأرشفة\n* صور ملف شخصي متحركة (Video Avatars)\n* أيقونات تطبيق مخصصة لشاشة الهاتف\n* زيادة حدود القنوات والمجموعات للضعف\n* ترجمة فورية للمحادثات والقنوات",
        "price": 499,
        "category": "Social Media",
        "subcategory": "Telegram",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 17,
        "name": "Rust",
        "description": '# Rust - حساب ستيم كامل\n\nهتستلم حساب ستيم (Steam Account) خاص بيك واللعبة موجودة عليه كهدية (Gift). الحساب جديد تماماً (Fresh Account) مع صلاحيات دخول كاملة.\n\n## مميزات المنتج\n\n* **الملكية الكاملة:** هيوصلك بيانات الدخول الكاملة لحساب ستيم وللإيميل المربوط بيه، وتقدر تغير البيانات لبياناتك الشخصية.\n* **حالة الحساب:** حساب جديد (0 ساعات لعب) ومفهوش أي حظر سابق (No Bans).\n* **اللعب:** تقدر تلعب أونلاين وأوفلاين وتوصل لكل تحديثات اللعبة.\n\n## ملاحظات هامة قبل الشراء\n\n* حسابات ستيم بتيجي بريجون (دولة) عشوائي.\n* بعض الميزات زي "إضافة أصدقاء" (Add Friends) ممكن تكون مقفولة في البداية (لكن عادي الناس تقدر تعملك إضافة وتلعب معاهم).\n* التسليم فوري وتلقائي.',
        "price": 419,
        "category": "Games",
        "subcategory": "Shooter & Survival",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 14,
        "name": "ARC Raiders",
        "description": '# ARC Raiders - حساب ستيم كامل\n\nهتستلم حساب ستيم (Steam Account) خاص بيك واللعبة موجودة عليه كهدية (Gift). الحساب جديد تماماً (Fresh Account) مع صلاحيات دخول كاملة.\n\n## مميزات المنتج\n\n* **الملكية الكاملة:** هيوصلك بيانات الدخول الكاملة لحساب ستيم وللإيميل المربوط بيه، وتقدر تغير البيانات لبياناتك الشخصية.\n* **حالة الحساب:** حساب جديد (0 ساعات لعب) ومفهوش أي حظر سابق (No Bans).\n* **اللعب:** تقدر تلعب أونلاين وأوفلاين وتوصل لكل تحديثات اللعبة.\n\n## ملاحظات هامة قبل الشراء\n\n* حسابات ستيم بتيجي بريجون (دولة) عشوائي.\n* بعض الميزات زي "إضافة أصدقاء" (Add Friends) ممكن تكون مقفولة في البداية (لكن عادي الناس تقدر تعملك إضافة وتلعب معاهم).\n* التسليم فوري وتلقائي.',
        "price": 1089,
        "category": "Games",
        "subcategory": "Shooter & Survival",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 25,
        "name": "ChatGPT Go 1 Year",
        "description": '# ChatGPT Go 1 Year - حساب خاص (Private)\n\nهتستلم حساب ChatGPT Go خاص بيك، شغال لمدة سنة كاملة. الحساب "Private" يعني بتاعك لوحدك ومش مشترك مع حد تاني.\n\n## تفاصيل المنتج\n\n* **نوع الحساب:** حساب خاص (Private Account) كامل الصلاحيات.\n* **المدة:** صلاحية لمدة 12 شهر (سنة كاملة).\n* **الضمان:** ضمان استبدال لمدة 30 يوم في حالة وجود مشكلة في الحساب.\n\n## تنبيه هام جداً قبل الشراء\n\n> **النسخة دي هي ChatGPT Go فقط.**\n> هذا المنتج **ليس** اشتراك ChatGPT Plus ولا ChatGPT Pro.',
        "price": 109,
        "category": "Software",
        "subcategory": "AI Tools",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 29,
        "name": "Telegram Premium 6 Month",
        "description": "## Telegram Premium 6 Months\n\nتفعيل **رسمي** على حسابك الشخصي\n\n### المميزات:\n\n* رفع حجم الملفات إلى **4 جيجابايت** للملف الواحد\n* **سرعة تحميل مضاعفة** للملفات والوسائط\n* تحويل **الرسائل الصوتية إلى نص** مكتوب تلقائياً\n* طقم **ملصقات مميزة** وتفاعلات فريدة حصرياً\n* شارة **النجمة الزرقاء** بجانب اسمك الشخصي\n* إيقاف **الإعلانات** تماماً في القنوات العامة\n\n### خصائص إضافية:\n\n* إدارة متقدمة للمحادثات والأرشفة\n* صور ملف شخصي متحركة (Video Avatars)\n* أيقونات تطبيق مخصصة لشاشة الهاتف\n* زيادة حدود القنوات والمجموعات للضعف\n* ترجمة فورية للمحادثات والقنوات",
        "price": 829,
        "category": "Social Media",
        "subcategory": "Telegram",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 31,
        "name": "Google Gemini AI Premium 1 Year",
        "description": "# Google Gemini AI Premium - اشتراك سنة كاملة \n\nهتحصل على اشتراك Google AI Premium لمدة 12 شهر على حسابك الخاص. الباقة دي بتجمع بين أقوى نماذج الذكاء الاصطناعي من جوجل ومساحة تخزين سحابية ضخمة.\n\n## مميزات الاشتراك (Google AI Pro Plan)\n\n* **الذكاء الاصطناعي المتقدم:** وصول كامل لنموذج **Gemini Advanced** (أقوى وأذكى من النسخة المجانية) للمساعدة في البرمجة، التحليل، والكتابة المعقدة.\n* **مساحة تخزين ضخمة:** مساحة **2 تيرابايت (2TB)** على Google Drive و Gmail و Google Photos تحفظ فيها كل ملفاتك وصورك بأمان.\n* **أدوات الفيديو (Veo & Flow):** رصيد شهري (1000 نقطة) لاستخدام أدوات إنشاء الفيديو بالذكاء الاصطناعي (Text-to-Video) بجودة عالية.\n* **الدمج مع تطبيقات جوجل:** الذكاء الاصطناعي هينكتبلك إيميلات، يظبطلك ملفات Docs، ويعملك عروض في Slides بشكل تلقائي.\n* **مميزات إضافية:** مزايا Google Home Premium، وخصومات في متجر جوجل، ومكالمات فيديو أطول في Google Meet.\n\n## شروط الخدمة\n\n* **نوع الحساب:** التفعيل بيتم على إيميل Gmail جديد (Fresh Account).",
        "price": 169,
        "category": "Software",
        "subcategory": "AI Tools",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 32,
        "name": "ExpressVPN Premium 1 Month",
        "description": "# ExpressVPN Premium - اشتراك شهر كامل \n\n## مميزات الاشتراك\n\n* **الخصوصية والأمان:** حساب خاص بيك، وتشفير عسكري للبيانات، يعني تصفح آمن 100%.\n* **عدد الأجهزة:** تقدر تشغل الحساب على 5 أجهزة في نفس الوقت (كمبيوتر، موبايل، تابلت، رواتر).\n* **السرعة:** سرعة مفتوحة (Unlimited Bandwidth) وممتازة للستريمنج والجيمنج 4K بدون تقطيع.\n* **التوافق:** شغال على كل الأنظمة (Windows, Mac, iOS, Android, Linux).\n* **السيرفرات:** وصول لأكثر من 100 دولة وتخطي أي حجب جغرافي.\n\n## طريقة الاستلام\n\n* هيوصلك **كود تفعيل (Activation Code)** مخصص للكمبيوتر.\n* وهيوصلك **إيميل وباسورد** لتسجيل الدخول على الموبايل.\n\n\n\n",
        "price": 50,
        "category": "Software",
        "subcategory": "VPN",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 18,
        "name": "EA Sports FC 25",
        "description": '# EA Sports FC 25 - حساب ستيم كامل\n\nهتستلم حساب ستيم (Steam Account) خاص بيك واللعبة موجودة عليه كهدية (Gift). الحساب جديد تماماً (Fresh Account) مع صلاحيات دخول كاملة.\n\n## مميزات المنتج\n\n* **الملكية الكاملة:** هيوصلك بيانات الدخول الكاملة لحساب ستيم وللإيميل المربوط بيه، وتقدر تغير البيانات لبياناتك الشخصية.\n* **حالة الحساب:** حساب جديد (0 ساعات لعب) ومفهوش أي حظر سابق (No Bans).\n* **اللعب:** تقدر تلعب أونلاين وأوفلاين وتوصل لكل تحديثات اللعبة.\n\n## ملاحظات هامة قبل الشراء\n\n* حسابات ستيم بتيجي بريجون (دولة) عشوائي.\n* بعض الميزات زي "إضافة أصدقاء" (Add Friends) ممكن تكون مقفولة في البداية (لكن عادي الناس تقدر تعملك إضافة وتلعب معاهم).\n* التسليم فوري وتلقائي.',
        "price": 229,
        "category": "Games",
        "subcategory": "Sports",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 22,
        "name": "Cyberpunk 2077",
        "description": '# Cyberpunk 2077 - حساب ستيم كامل\n\nهتستلم حساب ستيم (Steam Account) خاص بيك واللعبة موجودة عليه كهدية (Gift). الحساب جديد تماماً (Fresh Account) مع صلاحيات دخول كاملة.\n\n## مميزات المنتج\n\n* **الملكية الكاملة:** هيوصلك بيانات الدخول الكاملة لحساب ستيم وللإيميل المربوط بيه، وتقدر تغير البيانات لبياناتك الشخصية.\n* **حالة الحساب:** حساب جديد (0 ساعات لعب) ومفهوش أي حظر سابق (No Bans).\n* **اللعب:** تقدر تلعب أونلاين وأوفلاين وتوصل لكل تحديثات اللعبة.\n\n## ملاحظات هامة قبل الشراء\n\n* حسابات ستيم بتيجي بريجون (دولة) عشوائي.\n* بعض الميزات زي "إضافة أصدقاء" (Add Friends) ممكن تكون مقفولة في البداية (لكن عادي الناس تقدر تعملك إضافة وتلعب معاهم).\n* التسليم فوري وتلقائي.',
        "price": 459,
        "category": "Games",
        "subcategory": "Action & Open World",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 21,
        "name": "The Witcher 3: Wild Hunt",
        "description": '# The Witcher 3: Wild Hunt - حساب ستيم كامل\n\nهتستلم حساب ستيم (Steam Account) خاص بيك واللعبة موجودة عليه كهدية (Gift). الحساب جديد تماماً (Fresh Account) مع صلاحيات دخول كاملة.\n\n## مميزات المنتج\n\n* **الملكية الكاملة:** هيوصلك بيانات الدخول الكاملة لحساب ستيم وللإيميل المربوط بيه، وتقدر تغير البيانات لبياناتك الشخصية.\n* **حالة الحساب:** حساب جديد (0 ساعات لعب) ومفهوش أي حظر سابق (No Bans).\n* **اللعب:** تقدر تلعب أونلاين وأوفلاين وتوصل لكل تحديثات اللعبة.\n\n## ملاحظات هامة قبل الشراء\n\n* حسابات ستيم بتيجي بريجون (دولة) عشوائي.\n* بعض الميزات زي "إضافة أصدقاء" (Add Friends) ممكن تكون مقفولة في البداية (لكن عادي الناس تقدر تعملك إضافة وتلعب معاهم).\n* التسليم فوري وتلقائي.',
        "price": 179,
        "category": "Games",
        "subcategory": "Action & Open World",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 23,
        "name": "Elden Ring",
        "description": '# Elden Ring - حساب ستيم كامل\n\nهتستلم حساب ستيم (Steam Account) خاص بيك واللعبة موجودة عليه كهدية (Gift). الحساب جديد تماماً (Fresh Account) مع صلاحيات دخول كاملة.\n\n## مميزات المنتج\n\n* **الملكية الكاملة:** هيوصلك بيانات الدخول الكاملة لحساب ستيم وللإيميل المربوط بيه، وتقدر تغير البيانات لبياناتك الشخصية.\n* **حالة الحساب:** حساب جديد (0 ساعات لعب) ومفهوش أي حظر سابق (No Bans).\n* **اللعب:** تقدر تلعب أونلاين وأوفلاين وتوصل لكل تحديثات اللعبة.\n\n## ملاحظات هامة قبل الشراء\n\n* حسابات ستيم بتيجي بريجون (دولة) عشوائي.\n* بعض الميزات زي "إضافة أصدقاء" (Add Friends) ممكن تكون مقفولة في البداية (لكن عادي الناس تقدر تعملك إضافة وتلعب معاهم).\n* التسليم فوري وتلقائي.',
        "price": 579,
        "category": "Games",
        "subcategory": "Action & Open World",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 19,
        "name": "Battlefield 6",
        "description": '# Battlefield 6 - حساب ستيم كامل\n\nهتستلم حساب ستيم (Steam Account) خاص بيك واللعبة موجودة عليه كهدية (Gift). الحساب جديد تماماً (Fresh Account) مع صلاحيات دخول كاملة.\n\n## مميزات المنتج\n\n* **الملكية الكاملة:** هيوصلك بيانات الدخول الكاملة لحساب ستيم وللإيميل المربوط بيه، وتقدر تغير البيانات لبياناتك الشخصية.\n* **حالة الحساب:** حساب جديد (0 ساعات لعب) ومفهوش أي حظر سابق (No Bans).\n* **اللعب:** تقدر تلعب أونلاين وأوفلاين وتوصل لكل تحديثات اللعبة.\n\n## ملاحظات هامة قبل الشراء\n\n* حسابات ستيم بتيجي بريجون (دولة) عشوائي.\n* بعض الميزات زي "إضافة أصدقاء" (Add Friends) ممكن تكون مقفولة في البداية (لكن عادي الناس تقدر تعملك إضافة وتلعب معاهم).\n* التسليم فوري وتلقائي.',
        "price": 1269,
        "category": "Games",
        "subcategory": "Shooter & Survival",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 16,
        "name": "Red Dead Redemption 2",
        "description": '# Red Dead Redemption 2 - حساب ستيم كامل\n\nهتستلم حساب ستيم (Steam Account) خاص بيك واللعبة موجودة عليه كهدية (Gift). الحساب جديد تماماً (Fresh Account) مع صلاحيات دخول كاملة.\n\n## مميزات المنتج\n\n* **الملكية الكاملة:** هيوصلك بيانات الدخول الكاملة لحساب ستيم وللإيميل المربوط بيه، وتقدر تغير البيانات لبياناتك الشخصية.\n* **حالة الحساب:** حساب جديد (0 ساعات لعب) ومفهوش أي حظر سابق (No Bans).\n* **اللعب:** تقدر تلعب أونلاين وأوفلاين وتوصل لكل تحديثات اللعبة.\n\n## ملاحظات هامة قبل الشراء\n\n* حسابات ستيم بتيجي بريجون (دولة) عشوائي.\n* بعض الميزات زي "إضافة أصدقاء" (Add Friends) ممكن تكون مقفولة في البداية (لكن عادي الناس تقدر تعملك إضافة وتلعب معاهم).\n* التسليم فوري وتلقائي.',
        "price": 509,
        "category": "Games",
        "subcategory": "Action & Open World",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 33,
        "name": "Zoom Pro 1 Month",
        "description": "# Zoom Pro - حساب خاص لمدة شهر\n\nهتستلم حساب Zoom Pro خاص بيك (Private Account) كامل الصلاحيات لمدة شهر. الحساب ده مثالي للاجتماعات الطويلة، الكورسات الأونلاين، والشركات.\n\n## مميزات الاشتراك\n\n* **الوقت المفتوح:** مدة الاجتماع بتوصل لـ 30 ساعة متواصلة (بدلاً من 40 دقيقة في المجاني).\n* **العدد:** يستوعب لحد 100 مشارك في الاجتماع الواحد.\n* **الخصوصية:** حساب خاص بيك لوحدك (Not Shared) ومحدش بيدخله غيرك.\n* **أدوات التحكم:** صلاحيات الهوست كاملة (Host Controls)، تسجيل الاجتماعات سحابياً (Cloud Recording)، وخلفيات افتراضية.\n* **النظام:** الحساب بيشتغل بنظام التجديد التلقائي (14 يوم + 14 يوم) ليكمل الشهر.\n\n\n",
        "price": 119,
        "category": "Software",
        "subcategory": "Productivity",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 1,
        "name": "Windows 10 Pro",
        "description": "## Windows 10 Pro Retail Key\n\n**كود أصلي لتفعيل Windows 10 Pro.  \n\n### المميزات\n- مفتاح أصلي ومرخّص من **Microsoft**  \n- يدعم أنظمة **32 بت و64 بت**  \n- متوافق مع **جميع لغات ويندوز**  \n- يدعم **التحديثات عبر الإنترنت**    \n- ترخيص **مدى الحياة** بدون أي اشتراكات  \n- استخدام لمرة واحدة فقط\n\n### OEM Key\n> نسخة تتوقف عند تغيير الجهاز أو الهاردوير\n### Retail Key\n> ترتبط بالحساب، ولو غيرت الجهاز بتفضل معاك",
        "price": 49,
        "category": "Software",
        "subcategory": "Operating Systems",
        "delivery_type": "auto",
        "is_active": True,
    },
    {
        "id": 2,
        "name": "Windows 11 Pro",
        "description": "## Windows 11 Pro Retail Key\n\n**كود أصلي لتفعيل Windows 11 Pro.  \n\n### المميزات\n- مفتاح أصلي ومرخّص من **Microsoft**  \n- يدعم أنظمة **32 بت و64 بت**  \n- متوافق مع **جميع لغات ويندوز**  \n- يدعم **التحديثات عبر الإنترنت**    \n- ترخيص **مدى الحياة** بدون أي اشتراكات  \n- استخدام لمرة واحدة فقط\n\n### OEM Key\n> نسخة تتوقف عند تغيير الجهاز أو الهاردوير\n### Retail Key\n> ترتبط بالحساب، ولو غيرت الجهاز بتفضل معاك",
        "price": 49,
        "category": "Software",
        "subcategory": "Operating Systems",
        "delivery_type": "auto",
        "is_active": True,
    },
    {
        "id": 26,
        "name": " ChatGPT Pro 1 Year",
        "description": "# ChatGPT Pro (GPT-5) - حساب خاص لمدة سنة\n\nهتستلم حساب ChatGPT Pro كامل الصلاحيات لمدة 12 شهر. الحساب خاص بيك لوحدك (Private) ومش مشترك مع حد تاني.\n\n## مميزات الخدمة\n\n* **الخصوصية:** الحساب ملكك 100%، وتاريخ المحادثات (Chat History) خاص بيك ومحدش يقدر يشوفه غيرك.\n* **النوع:** اشتراك Pro (GPT-5 Access) حساب خاص.",
        "price": 349,
        "category": "Software",
        "subcategory": "AI Tools",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 24,
        "name": "Minecraft Java Bedrock Edition",
        "description": "# Minecraft Java & Bedrock Edition - حساب كامل\n\nهتستلم حساب مايكروسوفت (Microsoft Account) مفعل عليه لعبة ماينكرافت بالنسختين (Java & Bedrock). الحساب ملكية كاملة ليك (Not Game Pass) وتقدر تغير كل البيانات.\n\n## مميزات المنتج\n\n* **الملكية الكاملة:** الحساب بيجيلك ببياناته الأصلية (الإيميل والباسورد)، وتقدر تغير الإيميل، الباسورد، الاسم (Nickname)، والسكن (Skin) براحتك.\n* **حالة الحساب:** حساب جديد (Fresh) ومفهوش أي حظر سابق (No Bans) خاصة على سيرفر Hypixel.\n* **نوع النسخة:** رخصة رسمية مدى الحياة من متجر مايكروسوفت (Official License)، مش اشتراك جيم باس مؤقت.\n\n## ملاحظات هامة قبل الشراء\n\n* التسليم فوري وتلقائي.\n* لو كنت واخد بان (Ban) قبل كدة على سيرفر Hypixel، لازم تغير الـ IP بتاعك قبل ما تدخل بالحساب الجديد عشان ميتبندش.",
        "price": 439,
        "category": "Games",
        "subcategory": "Shooter & Survival",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 28,
        "name": "Wallpaper Engine",
        "description": "# Wallpaper Engine - حساب ستيم كامل (Full Access)\n\nهتستلم حساب ستيم (Steam Account) خاص بيك موجود عليه برنامج Wallpaper Engine. الحساب بيوصلك بملكية كاملة (Full Access) وتقدر تغير كل البيانات.\n\n## مميزات المنتج\n\n* **الملكية الكاملة:** بيوصلك بيانات حساب ستيم وبيانات الإيميل الأصلي المربوط بيه. تقدر تغير الإيميل والباسورد لبياناتك الشخصية وتتحكم في الحساب 100%.\n* **حالة الحساب:** حساب نظيف تماماً (No Cheats) وممكن بنسبة كبيرة تلاقي عليه ألعاب إضافية كهدية (Bonus Games).\n* **التسليم:** تسليم فوري وتلقائي.",
        "price": 99,
        "category": "Games",
        "subcategory": "Software & Tools",
        "delivery_type": "manual",
        "is_active": True,
    },
    {
        "id": 15,
        "name": "GTA V",
        "description": '# GTA V - حساب ستيم كامل\n\nهتستلم حساب ستيم (Steam Account) خاص بيك واللعبة موجودة عليه كهدية (Gift). الحساب جديد تماماً (Fresh Account) مع صلاحيات دخول كاملة.\n\n## مميزات المنتج\n\n* **الملكية الكاملة:** هيوصلك بيانات الدخول الكاملة لحساب ستيم وللإيميل المربوط بيه، وتقدر تغير البيانات لبياناتك الشخصية.\n* **حالة الحساب:** حساب جديد (0 ساعات لعب) ومفهوش أي حظر سابق (No Bans).\n* **اللعب:** تقدر تلعب أونلاين وأوفلاين وتوصل لكل تحديثات اللعبة.\n\n## ملاحظات هامة قبل الشراء\n\n* حسابات ستيم بتيجي بريجون (دولة) عشوائي.\n* بعض الميزات زي "إضافة أصدقاء" (Add Friends) ممكن تكون مقفولة في البداية (لكن عادي الناس تقدر تعملك إضافة وتلعب معاهم).\n* التسليم فوري وتلقائي.',
        "price": 525,
        "category": "Games",
        "subcategory": "Action & Open World",
        "delivery_type": "manual",
        "is_active": True,
    },
]

feedbacks = [
    {
        "id": 4,
        "user_id": "893539084558041109",
        "username": ".x3k",
        "product_name": "Canva Pro 1 Year",
        "rating": 5,
        "review": "راجل توب",
        "created_at": "2026-01-18T11:16:12.722Z",
    },
    {
        "id": 5,
        "user_id": "1081123605330534501",
        "username": "fireworks6833",
        "product_name": "Discord Nitro",
        "rating": 5,
        "review": "Very fast and good",
        "created_at": "2026-01-21T20:55:48.593Z",
    },
    {
        "id": 6,
        "user_id": "483642312417869845",
        "username": "sowzer",
        "product_name": "ChatGPT Pro 1 Year",
        "rating": 5,
        "review": "خدمه سريعه وراجل محترم وثقه",
        "created_at": "2026-01-22T19:57:11.284Z",
    },
    {
        "id": 7,
        "user_id": "551843271815725057",
        "username": "eyad8866",
        "product_name": "ChatGPT Pro 1 Year",
        "rating": 5,
        "review": "خدمه ممتازه انصح بالتعامل مع القدوه و الملك  صاحب السيرفر",
        "created_at": "2026-01-22T20:16:13.538Z",
    },
    {
        "id": 8,
        "user_id": "971406976456204298",
        "username": "omar_x11",
        "product_name": "Google Gemini AI Premium 1 Year",
        "rating": 5,
        "review": "The best in the West",
        "created_at": "2026-01-26T11:44:18.262Z",
    },
    {
        "id": 9,
        "user_id": "971890784657866783",
        "username": "vblam",
        "product_name": "ExpressVPN Premium 1 Month",
        "rating": 5,
        "review": "Very fast very professional",
        "created_at": "2026-01-26T15:57:19.758Z",
    },
    {
        "id": 10,
        "user_id": "971406976456204298",
        "username": "omar_x11",
        "product_name": "ChatGPT Pro 1 Year",
        "rating": 5,
        "review": "The best in the West",
        "created_at": "2026-01-27T22:01:15.077Z",
    },
    {
        "id": 11,
        "user_id": "729450986011099177",
        "username": "milano9.66",
        "product_name": "Discord Nitro",
        "rating": 5,
        "review": "<3 سرعه البرق",
        "created_at": "2026-02-03T02:26:38.075Z",
    },
    {
        "id": 12,
        "user_id": "1021507732869746708",
        "username": "abdelrhman7349",
        "product_name": "Canva Pro 1 Year",
        "rating": 5,
        "review": "محترم دائما",
        "created_at": "2026-02-03T07:17:25.687Z",
    },
    {
        "id": 13,
        "user_id": "729450986011099177",
        "username": "milano9.66",
        "product_name": "Adobe Creative Cloud",
        "rating": 5,
        "review": "اسطووووري",
        "created_at": "2026-02-04T23:17:57.977Z",
    },
    {
        "id": 14,
        "user_id": "483642312417869845",
        "username": "sowzer",
        "product_name": "Adobe Creative Cloud",
        "rating": 5,
        "review": "اجمد واحد",
        "created_at": "2026-02-05T16:18:15.824Z",
    },
    {
        "id": 15,
        "user_id": "425737941453635598",
        "username": "3o.os",
        "product_name": "Discord Nitro",
        "rating": 5,
        "review": "Fast and Trust",
        "created_at": "2026-02-05T19:17:40.233Z",
    },
    {
        "id": 16,
        "user_id": "621997641676619776",
        "username": "omarbatal17",
        "product_name": "Udemy Course Gift",
        "rating": 5,
        "review": "من كتر الجمدان مش عارف اكتب اي ولا اي\nسرعة فالرد تعامل قيمة احترام  🫡",
        "created_at": "2026-02-15T17:51:04.904Z",
    },
    {
        "id": 17,
        "user_id": "574399935160647680",
        "username": "essam.haraz",
        "product_name": "Discord Nitro",
        "rating": 5,
        "review": "اسرع من ذا فلاش",
        "created_at": "2026-02-16T17:28:38.359Z",
    },
    {
        "id": 18,
        "user_id": "906569737578901525",
        "username": "videoslayerhd",
        "product_name": "ChatGPT Pro 1 Year",
        "rating": 5,
        "review": "راجل محترم  و فضل واقف معايا لحد ما شغلتة",
        "created_at": "2026-02-16T22:51:11.521Z",
    },
]


def run_migration():
    session = SessionLocal()
    try:
        # Delete non-user data (Cascade from products down, and others)
        print("Clearing test data...")
        session.execute(
            text(
                "TRUNCATE TABLE store_products, store_coupons, store_tickets RESTART IDENTITY CASCADE;"
            )
        )
        session.commit()

        # Build maps
        product_map = {}
        for p in products_data:
            # Note: The provided `name` in the feedback list might have spaces weirdness.
            # e.g " ChatGPT Pro 1 Year" vs "ChatGPT Pro 1 Year". We strip it.
            insert_sql = text("""
                INSERT INTO store_products (id, name, description, price, category, subcategory, delivery_type, is_active)
                VALUES (:id, :name, :description, :price, :category, :subcategory, :delivery_type, :is_active)
                RETURNING id;
            """)
            res = session.execute(insert_sql, {**p, "name": p["name"].strip()})
            inserted_id = res.scalar()
            product_map[p["name"].strip()] = inserted_id

        # We need to account for manual id sequences now since we specified IDs
        session.execute(
            text(
                "SELECT setval('store_products_id_seq', (SELECT MAX(id) FROM store_products));"
            )
        )
        session.commit()

        print(f"Inserted {len(product_map)} products.")

        # Process feedback
        for f in feedbacks:
            discord_id = f["user_id"]
            username = f["username"].strip()
            email = f"{discord_id}@discord.local"

            # Check if user exists by email
            user_sql = text("SELECT id FROM users WHERE email = :email LIMIT 1")
            user_id = session.execute(user_sql, {"email": email}).scalar()

            if not user_id:
                # Insert new user
                create_user_sql = text("""
                    INSERT INTO users (email, full_name, is_active, is_superuser)
                    VALUES (:email, :full_name, true, false)
                    RETURNING id;
                """)
                user_id = session.execute(
                    create_user_sql, {"email": email, "full_name": username}
                ).scalar()

            # Find product ID
            p_name = f["product_name"].strip()
            # Handle potential mismatch - if product doesn't exist, we skip
            if p_name not in product_map:
                print(
                    f"Warning: Product '{p_name}' not found for review. Trying partial match."
                )
                # find first that contains this name or vice versa
                for k, v in product_map.items():
                    if p_name in k or k in p_name:
                        product_map[p_name] = v
                        break

            p_id = product_map.get(p_name)

            if p_id:
                insert_review = text("""
                    INSERT INTO store_reviews (product_id, user_id, rating, comment, is_verified_purchase, is_approved, created_at)
                    VALUES (:product_id, :user_id, :rating, :comment, true, true, :created_at)
                """)
                session.execute(
                    insert_review,
                    {
                        "product_id": p_id,
                        "user_id": user_id,
                        "rating": f["rating"],
                        "comment": f["review"],
                        "created_at": f["created_at"],
                    },
                )
            else:
                print(f"Failed to attach review for product: {p_name}")

        session.commit()
        print("Migration complete!")

    except Exception as e:
        session.rollback()
        if hasattr(e, "orig"):
            print(f"DB Error: {e.orig}")
        else:
            print(f"Error: {e}")
    finally:
        session.close()


if __name__ == "__main__":
    run_migration()
