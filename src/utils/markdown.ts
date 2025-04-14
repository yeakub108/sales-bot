// Utility function to convert markdown to HTML for rendering
export const formatMarkdown = (content: string): string => {
  let html = content;
  
  // Handle headers (###)
  html = html.replace(/###\s+(.+)$/gm, '<h3 class="text-lg font-bold mb-2 mt-3">$1</h3>');
  
  // Handle bold text (**text**)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Handle bullet points
  html = html.replace(/^-\s+(.+)$/gm, '<div class="ml-4 my-1">• $1</div>');
  
  // Handle numbered lists
  html = html.replace(/^(\d+)\. (.+)$/gm, '<div class="ml-4 my-1">$1. $2</div>');
  
  // Handle emoji sections (like 🔎 1. Eligibility Check)
  html = html.replace(/(🔎|🏠|💰|📍)\s+(\d+\. .+)$/gm, '<div class="font-bold text-blue-800 mt-3 mb-2">$1 $2</div>');
  
  // Handle line breaks
  html = html.replace(/\n/g, '<br />');
  
  return html;
};
