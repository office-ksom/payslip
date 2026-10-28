/**
 * Standard date & time formatting utilities for KSoM Payslip Application.
 */

/**
 * Formats an approved timestamp to standard Indian English date & time:
 * e.g. "28 Oct 2026, 11:06 am"
 * 
 * @param {string|number|Date} dateVal 
 * @returns {string} Formatted date & time, or 'N/A' if invalid
 */
export const formatApprovedDateTime = (dateVal) => {
  if (!dateVal) return 'N/A';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
