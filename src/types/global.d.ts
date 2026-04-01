// Extend the Window interface to include tidioChatApi
interface Window {
    tidioChatApi?: {
        hide: () => void;
        show: () => void;
        // Add other Tidio API methods here if needed
    };
}