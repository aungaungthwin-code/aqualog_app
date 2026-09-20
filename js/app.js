console.log("Fish Catch Recorder Started");

// PWA Service Worker ချိတ်ဆက်ခြင်း
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      console.log('SW registered:', reg);
    }).catch(err => console.log('SW registration failed:', err));
  });
}

// ==============================
// Toast Notification (Data ဝင်ကြောင်းပြရန်)
// ==============================
function showToast(message) {
    const toast = document.getElementById('toastMessage');
    const toastText = document.getElementById('toastText');
    if(toast && toastText) {
        toastText.textContent = message;
        toast.classList.remove('opacity-0', 'translate-y-[-20px]');
        toast.classList.add('opacity-100', 'translate-y-0');
        setTimeout(() => {
            toast.classList.remove('opacity-100', 'translate-y-0');
            toast.classList.add('opacity-0', 'translate-y-[-20px]');
        }, 2000);
    }
}

// ==============================
// Modal System
// ==============================
const modal = document.getElementById('customModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');
let modalConfirmCallback = null;
let modalCancelCallback = null; 

function showAlert(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalCancelBtn.classList.add('hidden');
    modalConfirmBtn.textContent = 'အိုကေ';
    modalConfirmCallback = null;
    modalCancelCallback = null;
    modal.classList.remove('hidden');
    modal.classList.add('opacity-100');
}

function showConfirm(title, message, onConfirm, onCancel = null) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalCancelBtn.classList.remove('hidden');
    modalConfirmBtn.textContent = 'မှန်ကန်ပါသည်';
    modalConfirmCallback = onConfirm;
    modalCancelCallback = onCancel;
    modal.classList.remove('hidden');
    modal.classList.add('opacity-100');
}

modalCancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    if (modalCancelCallback) modalCancelCallback();
});

modalConfirmBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    if (modalConfirmCallback) modalConfirmCallback();
});

// ==============================
// Navigation & Unified Back Button Logic
// ==============================
function showScreen(screenId, pushHistory = true, replaceState = false) {
    const screens = ['splashScreen', 'nameScreen', 'homeScreen', 'voucherScreen', 'recordingScreen', 'historyScreen', 'detailScreen', 'categoryScreen', 'reportScreen', 'backupRestoreScreen'];
    screens.forEach(s => {
        const el = document.getElementById(s);
        if (el) {
            if (s === screenId) {
                el.classList.remove('hidden');
                el.classList.add('flex');
            } else {
                el.classList.add('hidden');
                el.classList.remove('flex');
            }
        }
    });

    // (FIX): မှတ်တမ်းစာမျက်နှာသို့ ရောက်တိုင်း UI ကို အလိုလို Refresh လုပ်ပေးမည်
    if (screenId === 'historyScreen') {
        displayHistory();
    }

    if (pushHistory && screenId !== 'splashScreen') {
        try {
            if (replaceState) {
                history.replaceState({ screen: screenId }, "", "#" + screenId);
            } else {
                history.pushState({ screen: screenId }, "", "#" + screenId);
            }
        } catch (error) {
            console.warn("History API restricted by device");
        }
    }
}

window.addEventListener('popstate', (e) => {
    const targetScreen = e.state ? e.state.screen : 'homeScreen';
    const recordingScreen = document.getElementById('recordingScreen');

    if (recordingScreen && !recordingScreen.classList.contains('hidden') && voucherStatus === "OPEN") {
        showConfirm("ဘောင်ချာ ဖွင့်ထားဆဲဖြစ်သည်", "ဤဘောင်ချာကို မပိတ်ရသေးပါ။ အနောက်သို့ ပြန်ထွက်ရန် သေချာပါသလား?", 
        () => { 
            showScreen(targetScreen, false); 
        }, 
        () => { 
            try { history.pushState({ screen: 'recordingScreen' }, "", "#recordingScreen"); } catch(err){}
        });
    } else {
        showScreen(targetScreen, false);
    }
});

function getStatusBadgeHTML(status) {
    const isClosed = status === "CLOSED";
    const bgClass = isClosed ? "bg-red-100 text-red-700 border-red-200" : "bg-emerald-100 text-emerald-700 border-emerald-200";
    const displayStatus = isClosed ? "ပိတ်ထားသည်" : "ဖွင့်ထားသည်";
    return `<span class="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border ${bgClass}">${displayStatus}</span>`;
}

// ==============================
// Name Screen
// ==============================
const userNameInput = document.getElementById("userName");
const continueBtn = document.getElementById("continueBtn");
const welcomeMessage = document.getElementById("welcomeMessage");

continueBtn.addEventListener("click", function () {
    const userName = userNameInput.value.trim();
    if (userName === "") {
        showAlert("လိုအပ်ပါသည်", "ကျေးဇူးပြု၍ သင့်အမည်ကို ရိုက်ထည့်ပါ။");
        return;
    }
    localStorage.setItem("userName", userName);
    if(welcomeMessage) welcomeMessage.textContent = "မင်္ဂလာပါ, " + userName;
    showScreen('homeScreen');
});

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(function () {
        const savedName = localStorage.getItem("userName");
        if(savedName && userNameInput) userNameInput.value = savedName; 
        showScreen('nameScreen', false); 
        try {
            history.replaceState({ screen: 'nameScreen' }, "", "#nameScreen");
        } catch(e) {}
    }, 2500); 
});

// ==============================
// ခလုတ်နှိပ်လျှင် Back ပြန်ခြင်းများ
// ==============================
document.getElementById("createVoucherBtn").addEventListener("click", () => showScreen('voucherScreen'));
document.getElementById("historyBtn").addEventListener("click", () => {
    document.getElementById("historySearch").value = "";
    document.getElementById("historyDate").value = "";
    displayHistory();
    showScreen('historyScreen');
});
document.getElementById("manageCategoriesBtn").addEventListener("click", () => {
    renderCategoryList();
    showScreen('categoryScreen');
});
document.getElementById("reportMenuBtn").addEventListener("click", () => {
    showScreen('reportScreen');
    renderReport('overall');
});
document.getElementById("backupMenuBtn").addEventListener("click", () => {
    showScreen('backupRestoreScreen');
});

function goBackSafe() {
    try { history.back(); } catch(e) { showScreen('homeScreen'); }
}

document.getElementById("backHomeBtn").addEventListener("click", goBackSafe);
document.getElementById("backCategoryBtn").addEventListener("click", goBackSafe);
document.getElementById("backHistoryBtn").addEventListener("click", goBackSafe);
document.getElementById("backReportBtn").addEventListener("click", goBackSafe);
document.getElementById("backBackupBtn").addEventListener("click", goBackSafe);
document.getElementById("backDetailBtn").addEventListener("click", goBackSafe);
document.getElementById("backVoucherBtn").addEventListener("click", goBackSafe);

// ==============================
// Dashboard & Chart
// ==============================
let reportChartInstance = null;

function renderReport(filterType) {
    const filterOverallBtn = document.getElementById('filterOverallBtn');
    const filterMonthBtn = document.getElementById('filterMonthBtn');
    const filterCustomBtn = document.getElementById('filterCustomBtn');
    const customDateFilter = document.getElementById('customDateFilter');

    [filterOverallBtn, filterMonthBtn, filterCustomBtn].forEach(btn => {
        if(!btn) return;
        btn.classList.remove('bg-primary', 'text-white');
        btn.classList.add('bg-slate-100', 'text-slate-600');
    });

    if(filterType === 'overall') {
        filterOverallBtn.classList.add('bg-primary', 'text-white');
        filterOverallBtn.classList.remove('bg-slate-100', 'text-slate-600');
        if(customDateFilter) customDateFilter.classList.add('hidden');
    } else if(filterType === 'month') {
        filterMonthBtn.classList.add('bg-primary', 'text-white');
        filterMonthBtn.classList.remove('bg-slate-100', 'text-slate-600');
        if(customDateFilter) customDateFilter.classList.add('hidden');
    } else {
        filterCustomBtn.classList.add('bg-primary', 'text-white');
        filterCustomBtn.classList.remove('bg-slate-100', 'text-slate-600');
        if(customDateFilter) customDateFilter.classList.remove('hidden');
    }

    let vouchers = JSON.parse(localStorage.getItem("vouchers") || "[]");
    let filteredVouchers = vouchers;
    const today = new Date();

    if (filterType === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        filteredVouchers = vouchers.filter(v => {
            const vD = new Date(v.voucherDate);
            return vD >= oneMonthAgo && vD <= today;
        });
    } else if (filterType === 'custom') {
        const sDate = document.getElementById("reportStartDate").value;
        const eDate = document.getElementById("reportEndDate").value;
        if (sDate && eDate) {
            filteredVouchers = vouchers.filter(v => v.voucherDate >= sDate && v.voucherDate <= eDate);
        }
    }

    const catTotals = {};
    let grandTotal = 0; 

    filteredVouchers.forEach(v => {
        if (v.entries) {
            v.entries.forEach(e => {
                catTotals[e.category] = (catTotals[e.category] || 0) + e.weight;
                grandTotal += e.weight;
            });
        }
    });

    const reportGrandTotalEl = document.getElementById('reportGrandTotal');
    if(reportGrandTotalEl) {
        reportGrandTotalEl.textContent = grandTotal.toLocaleString();
    }

    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const labels = sortedCats.map(item => item[0]);
    const data = sortedCats.map(item => item[1]);

    const ctxEl = document.getElementById('myChart');
    if(ctxEl) {
        const ctx = ctxEl.getContext('2d');
        if (reportChartInstance) reportChartInstance.destroy();
        reportChartInstance = new Chart(ctx, {
            type: 'bar',
            data: { labels: labels, datasets: [{ label: 'အလေးချိန် (ပိဿာ)', data: data, backgroundColor: '#4f46e5', borderRadius: 4 }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
        });
    }

    const listEl = document.getElementById('reportList');
    if(listEl) {
        listEl.innerHTML = '';
        if (sortedCats.length === 0) {
            listEl.innerHTML = '<p class="text-slate-400 text-sm italic text-center py-4">အချက်အလက် မရှိပါ</p>';
        } else {
            sortedCats.forEach(([cat, weight], index) => {
                listEl.innerHTML += `
                    <div class="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <div class="flex items-center gap-3">
                            <span class="w-6 h-6 rounded-full bg-indigo-100 text-primary flex items-center justify-center text-xs font-bold">${index + 1}</span>
                            <span class="font-medium text-slate-700">${cat}</span>
                        </div>
                        <span class="font-bold text-slate-900">${weight} <span class="text-sm font-medium text-slate-500">ပိဿာ</span></span>
                    </div>
                `;
            });
        }
    }
}

document.getElementById('filterOverallBtn').addEventListener('click', () => renderReport('overall'));
document.getElementById('filterMonthBtn').addEventListener('click', () => renderReport('month'));
document.getElementById('filterCustomBtn').addEventListener('click', () => renderReport('custom'));
document.getElementById('applyCustomDateBtn').addEventListener('click', () => renderReport('custom'));

// ==============================
// Data Backup & Restore (Excel)
// ==============================
document.getElementById("exportDataBtn").addEventListener("click", () => {
    let vouchers = JSON.parse(localStorage.getItem("vouchers") || "[]");
    if (vouchers.length === 0) {
        showAlert("အချက်အလက် မရှိပါ", "Excel ဖြင့်ထုတ်ရန် မှတ်တမ်း မရှိသေးပါ။");
        return;
    }

    let csvContent = "\uFEFF"; 
    csvContent += "ဘောင်ချာနံပါတ်,နေ့စွဲ,ဖွင့်သည့်အချိန်,ပိတ်သည့်အချိန်,စာရင်းသွင်းသူ,အခြေအနေ,ငါးအမျိုးအစား,အလေးချိန်(ပိဿာ),မှတ်ချက်\n";

    vouchers.forEach(v => {
        const remark = (v.remark || "").replace(/,/g, " ").replace(/\n/g, " ");
        const oTime = v.openedAt || "";
        const cTime = v.closedAt || "";
        const displayStatus = v.status === "CLOSED" ? "ပိတ်ထားသည်" : "ဖွင့်ထားသည်";
        
        if (!v.entries || v.entries.length === 0) {
            csvContent += `${v.voucherNumber},${v.voucherDate},"${oTime}","${cTime}",${v.userName},${displayStatus},,,${remark}\n`;
        } else {
            v.entries.forEach(e => {
                csvContent += `${v.voucherNumber},${v.voucherDate},"${oTime}","${cTime}",${v.userName},${displayStatus},${e.category},${e.weight},${remark}\n`;
            });
        }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `Fish_Catch_Backup_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

document.getElementById('importDataBtn').addEventListener('click', () => {
    document.getElementById('importCsvInput').click();
});

function parseCSVLine(text) {
    let ret = [];
    let inQuote = false;
    let value = '';
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (inQuote) {
            if (char === '"' && i + 1 < text.length && text[i + 1] === '"') { value += '"'; i++; } 
            else if (char === '"') { inQuote = false; } 
            else { value += char; }
        } else {
            if (char === '"') inQuote = true;
            else if (char === ',') { ret.push(value); value = ''; }
            else value += char;
        }
    }
    ret.push(value);
    return ret;
}

document.getElementById('importCsvInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        let csvText = event.target.result;
        if(csvText.charCodeAt(0) === 0xFEFF) csvText = csvText.slice(1); 
        
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
        if(lines.length < 2) {
            showAlert("အမှား", "ဖိုင်ထဲတွင် အချက်အလက် မှန်ကန်မှု မရှိပါ။");
            return;
        }

        const voucherMap = {};
        for(let i = 1; i < lines.length; i++) {
            const cols = parseCSVLine(lines[i]);
            if(cols.length < 8) continue;
            
            const vNo = cols[0].trim();
            const vDate = cols[1].trim();
            const oTimeStr = cols[2].trim();
            const cTimeStr = cols[3].trim();
            const userName = cols[4].trim();
            const statusStr = cols[5].trim() === "ပိတ်ထားသည်" ? "CLOSED" : "OPEN";
            const category = cols[6].trim();
            const weight = parseFloat(cols[7].trim());
            const remark = cols[8] ? cols[8].trim() : "";

            if (!voucherMap[vNo]) {
                voucherMap[vNo] = {
                    voucherNumber: vNo, voucherDate: vDate, userName: userName,
                    openedAt: oTimeStr, closedAt: cTimeStr, status: statusStr,
                    remark: remark, entries: []
                };
            }
            if (category && !isNaN(weight)) {
                voucherMap[vNo].entries.push({ category: category, weight: weight });
            }
        }

        const newVouchers = Object.values(voucherMap);
        if(newVouchers.length > 0) {
            localStorage.setItem("vouchers", JSON.stringify(newVouchers));
            showAlert("အောင်မြင်ပါသည်", "အချက်အလက်များကို အောင်မြင်စွာ ပြန်လည်ထည့်သွင်းပြီးပါပြီ။");
        } else {
            showAlert("အမှား", "ဖိုင်ထဲမှ အချက်အလက်များကို ဆွဲယူ၍ မရပါ။");
        }
        e.target.value = ''; 
    };
    reader.readAsText(file);
});

// ==============================
// Categories & App logic follows
// ==============================
const fishCategorySelect = document.getElementById("fishCategory");
const categoryList = document.getElementById("categoryList");
const newCategoryInput = document.getElementById("newCategoryInput");
const addCategoryBtn = document.getElementById("addCategoryBtn");

let touchDragItem = null;
let touchDragStartY = 0;

function getCategories() {
    const defaultCats = ["ငါးမြစ်ချင်း", "ငါးကြင်း", "ငါးခေါင်းပွ", "ငါးရွှေဝါ", "ငါးဒန်", "ကက်ကဒစ်", "တီလားဘီးယား", "ငါးဖယ်", "ငါးခုံးမ", "ငါးနုတ်စုံ"];
    const saved = localStorage.getItem("categories");
    if (saved) {
        let parsedCats = JSON.parse(saved);
        if (!parsedCats.includes("တီလားဘီးယား")) {
            const mergedCats = [...new Set([...defaultCats, ...parsedCats])];
            localStorage.setItem("categories", JSON.stringify(mergedCats));
            return mergedCats;
        }
        return parsedCats;
    }
    localStorage.setItem("categories", JSON.stringify(defaultCats));
    return defaultCats;
}

function saveCategories(categories) {
    localStorage.setItem("categories", JSON.stringify(categories));
}

function populateFishCategoryDropdown() {
    const categories = getCategories();
    if(!fishCategorySelect) return;
    fishCategorySelect.innerHTML = '<option value="">ငါးအမျိုးအစား ရွေးပါ...</option>';
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        fishCategorySelect.appendChild(option);
    });
}
populateFishCategoryDropdown();

function renderCategoryList() {
    const categories = getCategories();
    if(!categoryList) return;
    categoryList.innerHTML = "";
    categories.forEach(category => {
        const item = document.createElement("div");
        item.className = "category-item flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm";
        item.dataset.category = category;

        const leftWrap = document.createElement("div");
        leftWrap.className = "flex items-center gap-3";

        const dragHandle = document.createElement("span");
        dragHandle.className = "drag-handle text-slate-400 text-xl cursor-grab";
        dragHandle.textContent = "⠿";

        const nameSpan = document.createElement("span");
        nameSpan.className = "font-medium text-slate-800";
        nameSpan.textContent = category;

        leftWrap.appendChild(dragHandle);
        leftWrap.appendChild(nameSpan);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "w-8 h-8 flex items-center justify-center text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors";
        deleteBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
        
        deleteBtn.addEventListener("click", () => {
            showConfirm("ဖျက်ရန် အတည်ပြုပါ", `"${category}" ကို ဖျက်ရန် သေချာပါသလား?`, () => {
                const updated = getCategories().filter(c => c !== category);
                saveCategories(updated);
                renderCategoryList();
                populateFishCategoryDropdown();
            });
        });

        dragHandle.addEventListener("touchstart", function (e) {
            touchDragItem = item;
            touchDragStartY = e.touches[0].clientY;
            item.classList.add("dragging");
            e.preventDefault();
        }, { passive: false });

        item.appendChild(leftWrap);
        item.appendChild(deleteBtn);
        categoryList.appendChild(item);
    });
}

if(categoryList) {
    categoryList.addEventListener("touchmove", function (e) {
        if (!touchDragItem) return;
        e.preventDefault();
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - touchDragStartY;
        touchDragItem.style.transform = `translateY(${deltaY}px)`;

        const items = Array.from(categoryList.children);
        const draggedRect = touchDragItem.getBoundingClientRect();
        const draggedCenterY = draggedRect.top + draggedRect.height / 2;

        for (let i = 0; i < items.length; i++) {
            const sibling = items[i];
            if (sibling === touchDragItem) continue;
            const sibRect = sibling.getBoundingClientRect();
            const sibCenterY = sibRect.top + sibRect.height / 2;

            if (Math.abs(draggedCenterY - sibCenterY) < sibRect.height / 2) {
                const draggedIdx = items.indexOf(touchDragItem);
                if (draggedIdx < i) {
                    categoryList.insertBefore(touchDragItem, sibling.nextSibling);
                } else {
                    categoryList.insertBefore(touchDragItem, sibling);
                }
                touchDragStartY = touchY;
                touchDragItem.style.transform = "translateY(0px)";
                break;
            }
        }
    }, { passive: false });

    categoryList.addEventListener("touchend", function () {
        if (!touchDragItem) return;
        touchDragItem.classList.remove("dragging");
        touchDragItem.style.transform = "";
        
        const newOrder = Array.from(categoryList.children).map(item => item.dataset.category);
        saveCategories(newOrder);
        populateFishCategoryDropdown();
        touchDragItem = null;
    });
}

if(addCategoryBtn) {
    addCategoryBtn.addEventListener("click", function () {
        const newCat = newCategoryInput.value.trim();
        if (newCat === "") {
            showAlert("လိုအပ်ပါသည်", "ငါးအမည် အသစ်ရိုက်ထည့်ပါ။");
            return;
        }
        const categories = getCategories();
        if (categories.includes(newCat)) {
            showAlert("ရှိပြီးသားဖြစ်နေပါသည်", "ဤအမည်မှာ ရှိပြီးသားဖြစ်ပါသည်။");
            return;
        }
        categories.push(newCat);
        saveCategories(categories);
        newCategoryInput.value = "";
        renderCategoryList();
        populateFishCategoryDropdown();
    });
}

// ==============================
// VOUCHER DATA LOGIC
// ==============================
const voucherNumberInput = document.getElementById("voucherNumber");
const voucherDateInput = document.getElementById("voucherDate");
const fishWeightInput = document.getElementById("fishWeight");
const entryListContainer = document.getElementById("entryList");
const categoryTotalsContainer = document.getElementById("categoryTotals");
const overallTotalEl = document.getElementById("overallTotal");
const voucherRemarkEl = document.getElementById("voucherRemark");

let entries = [];
let voucherStatus = "OPEN";
let currentVoucherOpenedAt = null;
let currentVoucherClosedAt = null;

if(fishWeightInput) {
    fishWeightInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault(); 
            document.getElementById("addEntryBtn").click();
        }
    });
}

function saveVoucher() {
    let vouchers = JSON.parse(localStorage.getItem("vouchers") || "[]");
    const vNo = voucherNumberInput.value.trim();
    const voucher = {
        voucherNumber: vNo,
        voucherDate: voucherDateInput.value,
        userName: localStorage.getItem("userName") || "Unknown",
        entries: entries,
        remark: voucherRemarkEl ? voucherRemarkEl.value.trim() : "",
        status: voucherStatus,
        openedAt: currentVoucherOpenedAt,
        closedAt: currentVoucherClosedAt
    };

    const idx = vouchers.findIndex(v => v.voucherNumber === vNo);
    if (idx !== -1) {
        vouchers[idx] = voucher;
    } else {
        vouchers.push(voucher);
    }
    localStorage.setItem("vouchers", JSON.stringify(vouchers));
}

function updateTotals() {
    let total = entries.reduce((sum, e) => sum + e.weight, 0);
    if(overallTotalEl) overallTotalEl.textContent = total;

    const catTotals = {};
    entries.forEach(e => {
        catTotals[e.category] = (catTotals[e.category] || 0) + e.weight;
    });
    
    if(!categoryTotalsContainer) return;
    categoryTotalsContainer.innerHTML = "";
    if(Object.keys(catTotals).length === 0) {
         categoryTotalsContainer.innerHTML = '<p class="text-slate-400 text-sm italic col-span-2 text-center py-2">အချက်အလက် မရှိပါ</p>';
         return;
    }
    for (const cat in catTotals) {
        const el = document.createElement("div");
        el.className = "bg-white border border-slate-100 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 shadow-sm";
        el.innerHTML = `
            <span class="text-[13px] font-bold text-slate-500 w-full truncate">${cat}</span>
            <span class="font-extrabold text-primary text-[17px] w-full break-words leading-tight">
                ${catTotals[cat].toLocaleString()} <span class="text-xs text-slate-500 font-medium">ပိဿာ</span>
            </span>
        `;
        categoryTotalsContainer.appendChild(el);
    }
}

function renderRecentEntries() {
    if(!entryListContainer) return;
    entryListContainer.innerHTML = "";
    const recent = entries.slice(-3).reverse();
    if(recent.length === 0) {
        entryListContainer.innerHTML = '<p class="text-slate-400 text-sm italic text-center py-2">စာရင်း မရှိသေးပါ</p>';
        return;
    }
    recent.forEach(e => {
        const el = document.createElement("div");
        el.className = "flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl";
        el.innerHTML = `<span class="font-medium text-slate-700">${e.category}</span><span class="font-bold text-slate-900">${e.weight} ပိဿာ</span>`;
        entryListContainer.appendChild(el);
    });
}

document.getElementById("startVoucherBtn").addEventListener("click", function () {
    const vNo = voucherNumberInput.value.trim();
    const vDate = voucherDateInput.value;

    if (vNo === "") { showAlert("လိုအပ်ပါသည်", "ကျေးဇူးပြု၍ ဘောင်ချာနံပါတ် ထည့်ပါ။"); return; }
    if (vDate === "") { showAlert("လိုအပ်ပါသည်", "ကျေးဇူးပြု၍ နေ့စွဲ ရွေးချယ်ပါ။"); return; }

    let existingVouchers = JSON.parse(localStorage.getItem("vouchers") || "[]");
    const dup = existingVouchers.find(v => v.voucherNumber === vNo);

    if (dup) {
        showConfirm("ဘောင်ချာနံပါတ် တူနေပါသည်", `ဘောင်ချာနံပါတ် "${vNo}" သည် ရှိပြီးသားဖြစ်ပါသည်။ ထိုဘောင်ချာကို ဖွင့်လိုပါသလား?`, () => {
            openVoucherForEntry(dup);
        });
        return;
    }

    entries = [];
    voucherStatus = "OPEN";
    currentVoucherClosedAt = null;
    currentVoucherOpenedAt = new Date().toISOString();

    document.getElementById("displayVoucherNumber").textContent = vNo;
    document.getElementById("displayVoucherDate").textContent = vDate;
    
    if(fishCategorySelect) fishCategorySelect.value = "";
    if(fishWeightInput) fishWeightInput.value = "";
    if(voucherRemarkEl) voucherRemarkEl.value = "";
    
    toggleRecordingControls(false);
    updateTotals();
    renderRecentEntries();
    
    showScreen('recordingScreen', true, true);
});

document.getElementById("addEntryBtn").addEventListener("click", function () {
    if (voucherStatus === "CLOSED") { showAlert("အသိပေးချက်", "ဤဘောင်ချာမှာ ပိတ်ထားပြီး ဖြစ်ပါသည်။"); return; }
    
    const cat = fishCategorySelect.value;
    const wStr = fishWeightInput.value;
    
    if (cat === "") { showAlert("လိုအပ်ပါသည်", "ငါးအမျိုးအစား ရွေးချယ်ပေးပါ။"); return; }
    if (wStr === "") { showAlert("လိုအပ်ပါသည်", "အလေးချိန် ထည့်ပေးပါ။"); return; }
    
    const weight = Number(wStr);
    if (isNaN(weight) || weight <= 0) { showAlert("အမှား", "ကျေးဇူးပြု၍ မှန်ကန်သော အလေးချိန်ကို ထည့်ပါ။"); return; }

    entries.push({ category: cat, weight: weight });
    updateTotals();
    renderRecentEntries();
    
    showToast(`"${cat}" (${weight} ပိဿာ) သွင်းပြီးပါပြီ`);
    
    fishWeightInput.value = "";
    saveVoucher();
    
    setTimeout(() => {
        fishWeightInput.focus();
    }, 50);
});

document.getElementById("deleteLatestBtn").addEventListener("click", function () {
    if (voucherStatus === "CLOSED") { showAlert("အသိပေးချက်", "ဤဘောင်ချာမှာ ပိတ်ထားပြီး ဖြစ်ပါသည်။"); return; }
    if (entries.length === 0) { showAlert("အချက်အလက် မရှိပါ", "ဖျက်ရန် စာရင်း မရှိသေးပါ။"); return; }

    showConfirm("စာရင်းဖျက်ရန်", "နောက်ဆုံးသွင်းထားသော စာရင်းကို ဖျက်ရန် သေချာပါသလား?", () => {
        entries.pop();
        updateTotals();
        renderRecentEntries();
        saveVoucher();
    });
});

document.getElementById("closeVoucherBtn").addEventListener("click", function () {
    if (voucherStatus === "CLOSED") { showAlert("အသိပေးချက်", "ဘောင်ချာကို ပိတ်ပြီးသား ဖြစ်ပါသည်။"); return; }
    
    showConfirm("ဘောင်ချာပိတ်ရန်", "ဤဘောင်ချာကို ပိတ်ရန် သေချာပါသလား?", () => {
        currentVoucherClosedAt = new Date().toISOString();
        voucherStatus = "CLOSED";
        saveVoucher();
        toggleRecordingControls(true);
        showAlert("အောင်မြင်ပါသည်", "ဘောင်ချာကို အောင်မြင်စွာ ပိတ်လိုက်ပါပြီ။");
    });
});

function toggleRecordingControls(disabled) {
    if(fishCategorySelect) fishCategorySelect.disabled = disabled;
    if(fishWeightInput) fishWeightInput.disabled = disabled;
    const addBtn = document.getElementById("addEntryBtn");
    const delBtn = document.getElementById("deleteLatestBtn");
    const closeBtn = document.getElementById("closeVoucherBtn");
    
    if(addBtn) addBtn.disabled = disabled;
    if(delBtn) delBtn.disabled = disabled;
    if(voucherRemarkEl) voucherRemarkEl.disabled = disabled;
    if(closeBtn) closeBtn.disabled = disabled;
    
    const els = [fishCategorySelect, fishWeightInput, addBtn, delBtn, voucherRemarkEl, closeBtn];
    els.forEach(el => {
        if(!el) return;
        if(disabled) el.classList.add("opacity-50");
        else el.classList.remove("opacity-50");
    });
}

// ==============================
// HISTORY & DETAILS
// ==============================
const historyList = document.getElementById("historyList");
const historySearch = document.getElementById("historySearch");
const historyDate = document.getElementById("historyDate");

function displayHistory() {
    let vouchers = JSON.parse(localStorage.getItem("vouchers") || "[]");
    const search = historySearch.value.trim().toLowerCase();
    const dateF = historyDate.value;
    historyList.innerHTML = "";

    if (vouchers.length === 0) {
        historyList.innerHTML = '<div class="text-center p-8 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm"><span class="text-3xl block mb-2">📭</span>ဘောင်ချာမှတ်တမ်း မရှိသေးပါ။</div>';
        return;
    }

    vouchers.sort((a, b) => new Date(b.closedAt || b.openedAt || 0) - new Date(a.closedAt || a.openedAt || 0));

    const filtered = vouchers.filter(v => {
        const matchS = String(v.voucherNumber).toLowerCase().includes(search) || (v.userName && v.userName.toLowerCase().includes(search));
        const matchD = dateF === "" || v.voucherDate === dateF;
        return matchS && matchD;
    });

    if (filtered.length === 0) {
        historyList.innerHTML = '<div class="text-center p-6 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">ရှာဖွေထားသော ဘောင်ချာ မတွေ့ပါ။</div>';
        return;
    }

    filtered.forEach(v => {
        const total = (v.entries || []).reduce((sum, e) => sum + (Number(e.weight) || 0), 0);
        
        const item = document.createElement("div");
        item.className = "bg-white p-5 rounded-3xl shadow-sm border border-slate-100 active:scale-[0.98] transition-transform cursor-pointer mb-4";
        
        const isClosed = v.status === "CLOSED";
        const timelineVisual = isClosed 
            ? `<div class="flex flex-col items-center mt-1.5 w-3">
                   <div class="w-2 h-2 rounded-full bg-slate-300"></div>
                   <div class="w-0.5 h-6 bg-slate-200 my-0.5"></div>
                   <div class="w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-50 shadow-sm shadow-red-200"></div>
               </div>`
            : `<div class="flex flex-col items-center mt-1.5 w-3">
                   <div class="w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-50 shadow-sm shadow-blue-200"></div>
                   <div class="w-0.5 h-6 bg-slate-200 my-0.5"></div>
                   <div class="w-2 h-2 rounded-full bg-slate-300"></div>
               </div>`;

        item.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <p class="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-0.5">ဘောင်ချာနံပါတ်</p>
                    <h3 class="font-extrabold text-slate-800 text-lg tracking-tight leading-none">${v.voucherNumber}</h3>
                </div>
                ${getStatusBadgeHTML(v.status)}
            </div>
            
            <div class="flex items-start gap-3">
                ${timelineVisual}
                <div class="flex-grow space-y-3">
                    <div>
                        <p class="text-[11px] font-bold text-slate-400 mb-0.5">စာရင်းသွင်းသူ</p>
                        <p class="text-sm font-bold text-slate-700">${v.userName || "အမည်မသိ"}</p>
                    </div>
                    <div class="flex justify-between items-end">
                        <div>
                            <p class="text-[11px] font-bold text-slate-400 mb-0.5">စုစုပေါင်း အလေးချိန် နှင့် နေ့စွဲ</p>
                            <p class="text-sm font-bold text-slate-700">${total} ပိဿာ <span class="text-slate-400 font-normal ml-1">• ${v.voucherDate}</span></p>
                        </div>
                        <button class="delete-voucher-btn text-red-500 font-bold text-[13px] flex items-center gap-1 hover:text-red-700 bg-red-50 px-2 py-1 rounded-md transition-colors" data-id="${v.voucherNumber}">
                            ဖျက်မည်
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        item.addEventListener("click", (e) => {
            if(e.target.closest('.delete-voucher-btn')) return;
            openVoucherDetail(v);
        });

        const delBtn = item.querySelector('.delete-voucher-btn');
        delBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            showConfirm("ဘောင်ချာဖျက်ရန်", `ဘောင်ချာ "${v.voucherNumber}" ကို ဖျက်ရန် သေချာပါသလား? ဖျက်ပြီးပါက ပြန်ယူ၍ မရနိုင်ပါ။`, () => {
                let all = JSON.parse(localStorage.getItem("vouchers") || "[]");
                all = all.filter(i => i.voucherNumber !== v.voucherNumber);
                localStorage.setItem("vouchers", JSON.stringify(all));
                displayHistory();
            });
        });

        historyList.appendChild(item);
    });
}

if(historySearch) historySearch.addEventListener("input", displayHistory);
if(historyDate) historyDate.addEventListener("change", displayHistory);
const clearDateBtn = document.getElementById("clearDateBtn");
if(clearDateBtn) clearDateBtn.addEventListener("click", () => { historyDate.value = ""; displayHistory(); });

function openVoucherDetail(v) {
    const content = document.getElementById("voucherDetailContent");
    const vEntries = Array.isArray(v.entries) ? v.entries : [];
    const allTotal = vEntries.reduce((sum, e) => sum + (Number(e.weight) || 0), 0);
    
    const catTotals = {};
    vEntries.forEach(e => {
        const c = e.category || "အမည်မသိ";
        catTotals[c] = (catTotals[c] || 0) + (Number(e.weight) || 0);
    });

    let catHtml = '';
    if(Object.keys(catTotals).length === 0){
        catHtml = '<p class="text-sm text-slate-500 italic">အချက်အလက် မရှိပါ</p>';
    } else {
        for(const c in catTotals) {
            catHtml += `<div class="flex justify-between bg-slate-50 border border-slate-100 p-2.5 rounded-lg mb-2 text-sm">
                <span class="text-slate-600">${c}</span>
                <span class="font-bold text-slate-800">${catTotals[c]} ပိဿာ</span>
            </div>`;
        }
    }

    content.innerHTML = `
        <div class="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-5 rounded-2xl text-center shadow-sm">
            <p class="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-1">စုစုပေါင်း အလေးချိန်</p>
            <p class="text-4xl font-extrabold text-slate-900">${allTotal} <span class="text-lg font-medium text-slate-500">ပိဿာ</span></p>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3 text-sm mt-4">
            <div class="flex justify-between border-b border-slate-50 pb-2">
                <span class="text-slate-500 font-medium">အခြေအနေ</span>
                ${getStatusBadgeHTML(v.status || "OPEN")}
            </div>
            <div class="flex justify-between border-b border-slate-50 pb-2">
                <span class="text-slate-500 font-medium">ဘောင်ချာနံပါတ်</span>
                <span class="font-bold text-slate-800">${v.voucherNumber}</span>
            </div>
            <div class="flex justify-between border-b border-slate-50 pb-2">
                <span class="text-slate-500 font-medium">နေ့စွဲ</span>
                <span class="font-bold text-slate-800">${v.voucherDate}</span>
            </div>
            <div class="flex justify-between border-b border-slate-50 pb-2">
                <span class="text-slate-500 font-medium">စာရင်းသွင်းသူ</span>
                <span class="font-bold text-slate-800">${v.userName}</span>
            </div>
            <div class="flex justify-between border-b border-slate-50 pb-2">
                <span class="text-slate-500 font-medium">ဖွင့်သည့်အချိန်</span>
                <span class="font-bold text-slate-800">${v.openedAt ? new Date(v.openedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</span>
            </div>
            <div class="flex justify-between border-b border-slate-50 pb-2">
                <span class="text-slate-500 font-medium">ပိတ်သည့်အချိန်</span>
                <span class="font-bold text-slate-800">${v.closedAt ? new Date(v.closedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</span>
            </div>
            <div class="flex justify-between pb-1">
                <span class="text-slate-500 font-medium">အကြိမ်အရေအတွက်</span>
                <span class="font-bold text-slate-800">${vEntries.length}</span>
            </div>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mt-4">
            <h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                အမျိုးအစားအလိုက် စာရင်း
            </h3>
            ${catHtml}
        </div>

        ${v.remark ? `
        <div class="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-sm mt-4">
            <p class="font-bold text-amber-800 mb-1 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                မှတ်ချက်
            </p>
            <p class="text-amber-900 whitespace-pre-wrap">${v.remark}</p>
        </div>` : ''}

        <button id="reopenVoucherBtn" class="w-full mt-4 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow transition-all active:scale-95 flex justify-center items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            ${v.status === "CLOSED" ? "ဘောင်ချာပြန်ဖွင့်၍ စာရင်းသွင်းရန်" : "စာရင်း ဆက်သွင်းရန်"}
        </button>
    `;

    document.getElementById("reopenVoucherBtn").addEventListener("click", () => openVoucherForEntry(v));
    
    const exportImageBtn = document.getElementById("exportImageBtn");
    const newExportBtn = exportImageBtn.cloneNode(true);
    exportImageBtn.parentNode.replaceChild(newExportBtn, exportImageBtn);

    if (v.status === "CLOSED") {
        newExportBtn.classList.remove("hidden");
        newExportBtn.addEventListener("click", () => exportVoucherAsImage(v));
    } else {
        newExportBtn.classList.add("hidden");
    }

    showScreen('detailScreen');
}

function openVoucherForEntry(voucher) {
    entries = Array.isArray(voucher.entries) ? voucher.entries : [];
    voucherStatus = "OPEN";
    currentVoucherOpenedAt = voucher.openedAt || new Date().toISOString();
    currentVoucherClosedAt = null;

    if(voucherNumberInput) voucherNumberInput.value = voucher.voucherNumber || "";
    if(voucherDateInput) voucherDateInput.value = voucher.voucherDate || "";
    const dispNo = document.getElementById("displayVoucherNumber");
    const dispDate = document.getElementById("displayVoucherDate");
    if(dispNo) dispNo.textContent = voucher.voucherNumber || "";
    if(dispDate) dispDate.textContent = voucher.voucherDate || "";
    if(voucherRemarkEl) voucherRemarkEl.value = voucher.remark || "";

    toggleRecordingControls(false);
    renderRecentEntries();
    updateTotals();
    saveVoucher(); 
    
    showScreen('recordingScreen', true, true);
}

// (FIX): ပုံထုတ်ရန် (ယခင်အတိုင်း Direct Download ပြန်ပြောင်းထားသည်)
function exportVoucherAsImage(v) {
    const vEntries = Array.isArray(v.entries) ? v.entries : [];
    const allTotal = vEntries.reduce((sum, e) => sum + (Number(e.weight) || 0), 0);
    const catTotals = {};
    vEntries.forEach(e => {
        const c = e.category || "အမည်မသိ";
        catTotals[c] = (catTotals[c] || 0) + (Number(e.weight) || 0);
    });
    
    const fmtTime = d => d ? new Date(d).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-';

    document.getElementById("receiptTotal").textContent = allTotal;
    document.getElementById("receiptVNo").textContent = v.voucherNumber;
    document.getElementById("receiptDate").textContent = v.voucherDate;
    document.getElementById("receiptUser").textContent = v.userName || "အမည်မသိ";
    document.getElementById("receiptOpen").textContent = fmtTime(v.openedAt);
    document.getElementById("receiptClose").textContent = fmtTime(v.closedAt);
    document.getElementById("receiptCount").textContent = vEntries.length;

    const receiptCats = document.getElementById("receiptCategories");
    receiptCats.innerHTML = "";
    if (Object.keys(catTotals).length === 0) {
        receiptCats.innerHTML = '<div class="text-slate-500 italic">အချက်အလက် မရှိပါ</div>';
    } else {
        for (const c in catTotals) {
            receiptCats.innerHTML += `<div class="flex justify-between">
                <span class="text-slate-600">${c}</span>
                <span class="font-bold text-slate-800">${catTotals[c]} ပိဿာ</span>
            </div>`;
        }
    }

    const remarkSec = document.getElementById("receiptRemarkSection");
    if (v.remark && v.remark.trim() !== "") {
        document.getElementById("receiptRemark").textContent = v.remark;
        remarkSec.classList.remove("hidden");
    } else {
        remarkSec.classList.add("hidden");
    }

    showAlert("ခေတ္တစောင့်ပါ...", "ပုံအဖြစ် ပြောင်းလဲနေပါသည်။ ကျေးဇူးပြု၍ ခဏစောင့်ပါ။");

    const targetElement = document.getElementById("receiptCapture");
    const scale = 2;

    domtoimage.toPng(targetElement, {
        bgcolor: '#ffffff',
        width: targetElement.clientWidth * scale,
        height: targetElement.clientHeight * scale,
        style: {
            transform: `scale(${scale})`,
            transformOrigin: 'top left'
        }
    })
    .then(function (dataUrl) {
        modal.classList.add('hidden');
        
        const link = document.createElement("a");
        link.download = `Voucher_${v.voucherNumber}.png`;
        link.href = dataUrl;
        link.click();
    })
    .catch(function (error) {
        modal.classList.add('hidden');
        console.error("Export Error: ", error);
        showAlert("အမှား", "ပုံအဖြစ်ပြောင်းလဲခြင်း မအောင်မြင်ပါ။ ပြန်လည်ကြိုးစားကြည့်ပါ။");
    });
}
