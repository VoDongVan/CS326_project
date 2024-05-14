const fgCircle = document.querySelector('.fg-circle');
const percentageText = document.querySelector('.percentage');

// Set progress percentage (e.g., 75%)
const percentage = 12/15 * 100;
const circumference = 1257; // Circumference of a circle with r=40
const progress = circumference - (percentage / 100) * circumference;
fgCircle.style.strokeDashoffset = progress;
percentageText.textContent = percentage + '%'