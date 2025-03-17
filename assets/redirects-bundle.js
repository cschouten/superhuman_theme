/**
 * Superhuman Help Scout to Zendesk Redirect Script
 * 
 * This script redirects users from Help Scout article URLs to the corresponding Zendesk article URLs.
 * It handles multiple Help Scout IDs mapping to a single Zendesk article.
 */

// Mapping of Help Scout article paths to Zendesk article IDs
const redirectMap = {
    "/article/582-achieving-inbox-zero": "38449739437587",
    "/article/502-triage": "38449739437587",
    "/article/520-admin-controls-and-team-features": "38458690700307",
    "/article/589-alias": "38458637218067",
    "/article/448-annual-plan": "38456215577619",
    "/article/552-ask-ai": "38458628979091",
    "/article/550-auto-summarize": "38458640102291",
    "/article/518-auto-bcc": "38458620737299",
    "/article/553-autocomplete": "38458586779155",
    "/article/517-autocorrect": "38458597661971",
    "/article/587-calendar-basics": "38449917283731",
    "/article/568-calendar-overview": "38458549947539",
    "/article/563-calendar": "38458504388627",
    "/article/564-collaborate-on-superhuman": "38458989457555",
    "/article/583-compose-reply": "38449763157011",
    "/article/450-contact-pane": "38456037129235",
    "/article/558-custom-split-inboxes": "38458483333907",
    "/article/461-mobile-customizing-swipes-and-triage-bar": "38458431506067",
    "/article/521-unwanted-emails": "38458459391635",
    "/article/557-default-split-inboxes": "38458392810643",
    "/article/431-download-superhuman": "38456800156435",
    "/article/559-executive-assistants": "38458965656723",
    "/article/526-gmail-rate-limiting": "38456805756435",
    "/article/532-google-advanced-protection-gap": "38456765647891",
    "/article/451-grammarly": "38458855314067",
    "/article/457-hubspot": "38458845573907",
    "/article/551-instant-reply": "38458397554963",
    "/article/595-labels-and-folders": "38458359354643",
    "/article/585-making-superhuman-your-own": "38450004008595",
    "/article/458-managing-accounts": "38456729592595",
    "/article/456-mass-archive": "38455959622803",
    "/article/463-mobile-navigation": "38458290528531",
    "/article/556-moving-conversations-between-important-and-other": "38458273793683",
    "/article/516-muting-conversations": "38458285159955",
    "/article/522-offline-access": "38458300297875",
    "/article/565-pipedrive": "38458811758227",
    "/article/531-pricing-plans": "38456109456147",
    "/article/455-read-statuses": "38457566867347",
    "/article/459-receipts-and-invoices": "38456121262355",
    "/article/452-remove-superhuman": "38456708381203",
    "/article/560-saml-authentication": "38456671881491",
    "/article/477-salesforce": "38458792231571",
    "/article/528-share-availability": "38457524200595",
    "/article/590-shared-conversations": "38450322526995",
    "/article/525-shared-conversation-and-team-comments": "38457432565267",
    "/article/584-shared-drafts": "38457302327187",
    "/article/515-shortcuts-for-international-keyboards": "38456661064595",
    "/article/460-signatures": "38456654276627",
    "/article/529-smart-send": "38456924099347",
    "/article/466-snippets": "38450007523475",
    "/article/588-snippets": "38450007523475",
    "/article/581-split-inbox-basics": "38449611367187",
    "/article/562-sso-for-google-and-microsoft": "38456478385683",
    "/article/580-superhuman-fundamentals": "38448760193939",
    "/article/447-superhuman-app": "38456447982483",
    "/article/555-superhuman-ai-tutorial": "38456908110227",
    "/article/594-superhuman-tips-en-espanol": "38458944837523",
    "/article/591-team-comments": "38450300675347",
    "/article/593-team-read-statuses-reply-indicators": "38450176724755",
    "/article/592-team-snippets": "38450275419155",
    "/article/453-unified-inbox": "38456456380051",
    "/article/454-updating-payment-details": "38456288851731",
    "/article/561-user-provisioning-scim": "38456240559891",
    "/article/549-write-with-ai": "38456855116307"
  };
  
  /**
   * Handles the redirection from Help Scout articles to Zendesk articles
   */
  function handleHelpScoutRedirect() {
    // Get the current path
    const currentPath = window.location.pathname;
    
    // Check if we need to redirect
    const zendeskId = redirectMap[currentPath];
    
    if (zendeskId) {
      // Build the new Zendesk URL
      const zendeskUrl = `https://help.superhuman.com/hc/en-us/articles/${zendeskId}`;
      
      // Redirect to the Zendesk article
      window.location.href = zendeskUrl;
    }
  }
  
  /**
   * Initialize the redirect handler when the page loads
   */
  function initRedirects() {
    // Get the current hostname
    const hostname = window.location.hostname;
    
    // Only run redirects on help.superhuman.com
    if (hostname === 'help.superhuman.com') {
      handleHelpScoutRedirect();
    }
  }
  
  // Run the initialization when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRedirects);
  } else {
    initRedirects();
  }