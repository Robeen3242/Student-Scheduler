export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
export function getSemesterEndDate(date_due: Date) {
    const year = date_due.getFullYear();
    const semesterEndDate = [
        new Date(year, 3, 30),  // End of Winter
        new Date(year, 5, 30),  // End of Spring
        new Date(year, 7, 31),  // End of Summer
        new Date(year, 11, 31), // End of Fall
    ];
    const dueDate = new Date(date_due);
    return semesterEndDate.find(endDate => dueDate <= endDate) ?? semesterEndDate[semesterEndDate.length - 1];
}

export function getSemester(date: Date) {
    const month = date.getMonth();

    if (month <= 3) return `Winter ${date.getFullYear()}`;
    if (month <= 5) return `Spring ${date.getFullYear()}`;
    if (month <= 7) return `Summer ${date.getFullYear()}`;
    return `Fall ${date.getFullYear()}`;
}