function quickSort(arr, compare = (a, b) => a - b) {
    if (arr.length <= 1) return arr;

    const midIdx = arr.length >> 1;
    const candidates = [arr[0], arr[midIdx], arr[arr.length - 1]];
    candidates.sort(compare);
    const pivot = candidates[1];

    const left = [],
        right = [],
        mid = [];
    for (const el of arr) {
        const cmp = compare(el, pivot);
        if (cmp < 0) left.push(el);
        else if (cmp > 0) right.push(el);
        else mid.push(el);
    }

    return [...quickSort(left, compare), ...mid, ...quickSort(right, compare)];
}

module.exports = { quickSort };
