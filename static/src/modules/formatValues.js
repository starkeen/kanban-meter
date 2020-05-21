export default {
    formatDate: (date) => {
        return date ? new Date(date).toLocaleDateString() : '—';
    },
    formatDateTime: (date) => {
        const currentDate = new Date(date);
        return currentDate.toLocaleString();
    },
    toFixed: (value, fixedVal) => {
        if (!isNaN(Math.floor(value)) && isFinite(value) && value !== null) {
            return value.toFixed(fixedVal || 2);
        }

        return value;
    },
    toFixedDaysAndHours: (days) => {
        const clearDays = Math.floor(days);
        const hours = (days - clearDays) * 24;

        if (clearDays > 0) {
            return `${clearDays} д. ${hours.toFixed(0)} ч.`;
        }

        if (clearDays === 0 && Math.floor(hours) === 0) {
            return `${(hours * 60).toFixed(0)} мин.`;
        }

        return `${hours.toFixed(0)} ч.`;
    },
};
