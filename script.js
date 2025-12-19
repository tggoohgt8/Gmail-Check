const API_URL = 'https://rapid-email-verifier.fly.dev/api/validate';

async function validateEmail() {
    const email = document.getElementById('emailInput').value.trim();
    const resultBox = document.getElementById('resultBox');
    const loading = document.getElementById('loading');

    if (!email) {
        alert('يرجى إدخال بريد إلكتروني.');
        return;
    }

    // إظهار رسالة الانتظار وإخفاء النتيجة السابقة
    loading.style.display = 'block';
    resultBox.style.display = 'none';

    try {
        const response = await fetch(`${API_URL}?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        // إخفاء الانتظار وإظهار النتيجة
        loading.style.display = 'none';
        displayResult(email, data);
        resultBox.style.display = 'block';

    } catch (error) {
        console.error('خطأ في الاتصال:', error);
        loading.style.display = 'none';
        alert('حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى.');
    }
}

function displayResult(email, data) {
    document.getElementById('resultEmail').textContent = email;

    const statusEl = document.getElementById('resultStatus');
    const detailsEl = document.getElementById('resultDetails');
    const checksEl = document.getElementById('resultChecks');

    // تحديد الحالة بناءً على رد API
    let statusText = 'غير معروف';
    let statusClass = 'risky';
    let detailsText = '';

    if (data.status === 'VALID') {
        statusText = 'بريد صالح ✅';
        statusClass = 'valid';
        detailsText = 'هذا البريد الإلكتروني موجود ويمكن استقبال الرسائل عليه.';
    } else if (data.status === 'INVALID_FORMAT' || data.status === 'INVALID_DOMAIN') {
        statusText = 'بريد غير صالح ❌';
        statusClass = 'invalid';
        detailsText = 'تركيب البريد الإلكتروني خاطئ أو النطاق غير موجود.';
    } else if (data.status === 'DISPOSABLE') {
        statusText = 'بريد مؤقت (Disposable) ⚠️';
        detailsText = 'هذا البريد من خدمة مؤقتة وقد لا يكون فعالاً.';
    } else {
        statusText = 'حالة غير مؤكدة';
        detailsText = 'تعذر التحقق من البريد بشكل قاطع.';
    }

    statusEl.textContent = statusText;
    statusEl.className = 'status ' + statusClass;
    detailsEl.textContent = detailsText;

    // عرض التفاصيل الفنية (الفحوصات) إذا وجدت
    checksEl.innerHTML = '';
    if (data.validations) {
        checksEl.innerHTML = '<h4>تفاصيل الفحص:</h4>';
        for (const [check, result] of Object.entries(data.validations)) {
            const checkItem = document.createElement('div');
            checkItem.className = 'check-item';
            // تحويل اسم الفحص إلى نص عربي مفهوم
            const checkName = {
                'syntax': 'التركيب النحوي',
                'domain_exists': 'وجود النطاق',
                'mx_records': 'سجلات خوادم البريد (MX)',
                'is_disposable': 'كشف البريد المؤقت'
            }[check] || check;
            checkItem.textContent = `${checkName}: ${result ? 'ناجح ✅' : 'فشل ❌'}`;
            checksEl.appendChild(checkItem);
        }
    }
}

function resetForm() {
    document.getElementById('emailInput').value = '';
    document.getElementById('resultBox').style.display = 'none';
    document.getElementById('emailInput').focus();
}
