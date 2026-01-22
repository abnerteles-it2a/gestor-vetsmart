
/**
 * Utility to handle WhatsApp integrations via Deep Links (Click to Chat).
 * This approach is free, serverless-friendly, and does not require approval from Meta.
 */

export const formatPhoneNumber = (phone: string): string => {
    // Remove non-digits
    return phone.replace(/\D/g, '');
};

export const openWhatsApp = (phone: string, text: string) => {
    const formattedPhone = formatPhoneNumber(phone);
    const encodedText = encodeURIComponent(text);
    
    // Check if it's mobile to decide between api.whatsapp.com (better for apps) or web.whatsapp.com
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    const baseUrl = isMobile 
        ? 'https://api.whatsapp.com/send' 
        : 'https://web.whatsapp.com/send';

    const url = `${baseUrl}?phone=${formattedPhone}&text=${encodedText}`;
    
    window.open(url, '_blank');
};

/**
 * Generates a standard greeting message for the clinic
 */
export const generateClinicMessage = (tutorName: string, content: string) => {
    return `Olá ${tutorName}, aqui é da VetSmart! 🐾\n\n${content}`;
};
