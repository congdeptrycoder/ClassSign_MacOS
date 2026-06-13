export const filterTableByColumn = <T extends Record<string, any>>(
    data: T[],
    filters: Partial<Record<keyof T, string>>
): T[] => {
    return data.filter(item => {
        return Object.entries(filters).every(([key, filterValue]) => {
            if (!filterValue) return true; // Nếu không có giá trị filter cho cột này, bỏ qua
            
            const itemValue = item[key as keyof T];
            if (itemValue === null || itemValue === undefined) {
                return false; // Nếu item không có giá trị nhưng có filter, thì không khớp
            }

            // Chuyển đổi về chuỗi và tìm kiếm chuỗi con không phân biệt hoa thường
            const itemString = String(itemValue).toLowerCase();
            const filterString = String(filterValue).toLowerCase();

            return itemString.includes(filterString);
        });
    });
};
