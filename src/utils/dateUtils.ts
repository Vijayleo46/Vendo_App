import { Timestamp } from 'firebase/firestore';

export const formatTimeAgo = (timestamp?: Timestamp | Date | number): string => {
    if (!timestamp) return 'JUST NOW';

    let date: Date;
    if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else {
        date = new Date(timestamp);
    }

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 30) return 'JUST NOW';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} MIN AGO`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} HR AGO`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} DAYS AGO`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} WEEKS AGO`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} MONTHS AGO`;

    return date.toLocaleDateString();
};
