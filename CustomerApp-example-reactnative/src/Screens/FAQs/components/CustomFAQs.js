import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import { useTranslation } from "react-i18next";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import pageServices from "../../../services/pageServices";
import appSettings from "../../../../Client/appSettings";

const client = process.env.CLIENT;

const CustomFAQs = (props) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [faqSections, setFaqSections] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);
  const { t } = useTranslation();
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps;

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        conditionalHeaderProps ? (
          <CustomHeader
            title={t("faqs")}
            leftComponent={<CommonHeaderLeft type="back" />}
            elevation={0}
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
            // dbgcolor="#12a14f"
            backgroundColor="#12a14f"
            showCustomIcons={true}
            hideicon={true}
            color="#FFFFFF"
          />
        ) : <CustomHeader
          title={options.title || route.name}
          leftComponent={<CommonHeaderLeft type="back" />}
          rightComponent={<CommonHeaderRight />}
        />
      ),
      title: t("faqs"),
    });
    GetFAQs();
  }, []);

  const GetFAQs = async () => {
    try {
      setLoading(true);
      const pageID = 18;
      const response = await pageServices.GetStaticPage(pageID);
      // console.log("response", response);

      if (!response.data) {
        console.error("Error", "Failed to get FAQ data.");
        setLoading(false);
        return;
      }

      // console.log("API Response:", response.data);
      setData(response.data);
      
      // Get FAQ categories
      const categories = parseFAQMenu(response.data);
      
      // Extract support sections from the same HTML (use RAW HTML)
      const supportSections = extractSupportSections(response.data);
      
      // Only clean text items AFTER parsing
      supportSections.forEach(section => {
        section.contentItems = section.contentItems.map(item => {
          if (item.type === "text") {
            return { ...item, text: cleanHTML(item.text) };
          }
          return item; // leave links untouched
        });
      });
      
      // Combine FAQ categories with support sections at the bottom
      const allSections = [...categories, ...supportSections];
      
      setFaqSections(allSections);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("FAQs Data fetching failed:", error);
    }
  };

  const parseFAQMenu = (htmlData) => {
    const menu = [];
    
    try {
      // console.log("Parsing FAQ menu:", typeof htmlData, htmlData);
      
      if (typeof htmlData === 'string' && htmlData.trim()) {
        // Pattern to extract FAQ categories with page IDs
        const pattern = /ui-sref="faqs\(\{pageIdEn:'(\d+)',pageIdAr:'(\d+)'\}\)".*?>(.*?)<i/gs;
        
        let match;
        while ((match = pattern.exec(htmlData)) !== null) {
          const pageIdEn = match[1];
          const pageIdAr = match[2];
          const rawTitle = match[3];
          
          const title = rawTitle
            .replace(/<[^>]+>/g, "")
            .replace(/\s+/g, " ")
            .replace(/\n/g, " ")   
            .replace(/\r/g, " ")
            .trim();
          
          menu.push({
            id: pageIdEn,
            title: title,
            pageIdEn: pageIdEn,
            pageIdAr: pageIdAr,
            items: [],
            isExpanded: false
          });
        }
      }
      
      // console.log("Parsed menu categories:", menu);
      return menu;
    } catch (error) {
      console.error("Error parsing FAQ menu:", error);
      return [];
    }
  };
  
  const parseFAQContent = (htmlData) => {
    const items = [];
    
    try {
      if (typeof htmlData === 'string' && htmlData.trim()) {
        // Clean the HTML and convert to readable text with proper formatting
        const cleanText = htmlData
          .replace(/<br\s*\/?>/gi, "\n")    // convert <br> to newline
          .replace(/<\/p>/gi, "\n\n")       // paragraph spacing
          .replace(/<[^>]+>/g, "")          // remove all HTML tags
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&rsquo;/g, "'")
          .replace(/&lsquo;/g, "'")
          .replace(/&rdquo;/g, '"')
          .replace(/&ldquo;/g, '"')
          .replace(/\s+\n/g, "\n")          // remove space before newline
          .replace(/\n\s+/g, "\n")          // remove indentation
          .replace(/\n{3,}/g, "\n\n")       // collapse too many newlines
          .trim();
        
        // Split by numbered list items (e.g., "1. ", "2. ", etc.)
        const parts = cleanText.split(/\n?\s*\d+\.\s+/g).filter(Boolean);
        
        if (parts.length > 1) {
          // Rebuild the list with proper Q&A structure
          parts.forEach((part, index) => {
            const lines = part.split("\n");
            const firstLine = lines[0].trim();
            const restOfContent = lines.slice(1).join("\n").trim();
            
            items.push({
              question: `${index + 1}. ${firstLine}`,
              answer: restOfContent || firstLine
            });
          });
        } else if (cleanText) {
          // Fallback: show all content as single item
          items.push({
            question: "FAQ Information",
            answer: cleanText
          });
        }
      }
    } catch (error) {
      console.error("Error parsing FAQ content:", error);
    }
    
    return items;
  };

  const cleanHTML = (html) => {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")       // REMOVE ALL HTML TAGS
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, '"')
      .replace(/&ldquo;/g, '"')
      .replace(/\s+\n/g, "\n")
      .replace(/\n\s+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const extractLinks = (html) => {
    const links = [];
    const linkRegex = /<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      links.push({
        url: match[1],
        text: match[2].trim()
      });
    }
    
    return links;
  };

  // Improved parseBlock: supports icon-only links when allowSocialLinks = true
  const parseBlock = (html, options = { allowSocialLinks: false }) => {
    const items = [];
    if (!html || typeof html !== 'string') return items;

    // helper: remove tags but keep inner text
    const stripTags = (str) => (str || "").replace(/<\/?[^>]+>/g, "").trim();

    // unify whitespace but keep structure for regex indexes
    const normalized = html.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();

    const linkRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(normalized)) !== null) {
      const url = match[1].trim();
      const rawLinkInner = match[2] || ""; // could be "<i class='fa ...'></i>" or "<b>text</b>"
      const textFromInner = stripTags(rawLinkInner);
      let linkText = textFromInner;

      // TEXT BEFORE LINK (cleaned of tags)
      const beforeHtml = normalized.substring(lastIndex, match.index);
      const beforeText = stripTags(beforeHtml);
      if (beforeText.length > 0) {
        items.push({ type: "text", text: beforeText });
      }

      // If link text is empty, but social icons are allowed, try to infer from <i> classes or URL
      if ((!linkText || linkText.length === 0) && options.allowSocialLinks) {
        // try from <i class="fa-brands fa-instagram"> etc
        const iconMatch = rawLinkInner.match(/fa-(instagram|facebook|whatsapp)/i);
        if (iconMatch) {
          linkText = iconMatch[1].charAt(0).toUpperCase() + iconMatch[1].slice(1);
        } else if (/instagram/i.test(url)) {
          linkText = "Instagram";
        } else if (/facebook/i.test(url)) {
          linkText = "Facebook";
        } else if (/wa\.me|whatsapp/i.test(url)) {
          linkText = "WhatsApp";
        }
      }

      // Decide whether to include this link
      const lower = (linkText || "").toLowerCase();
      const isSocial = ["instagram", "facebook", "whatsapp"].includes(lower);

      if (isSocial && !options.allowSocialLinks) {
        // skip social icon link for sections that disallow them
        lastIndex = linkRegex.lastIndex;
        continue;
      }

      if (linkText && linkText.length > 0) {
        items.push({ type: "link", text: linkText, url });
      }

      lastIndex = linkRegex.lastIndex;
    }

    // Remaining text after last link
    const remaining = stripTags(normalized.substring(lastIndex));
    if (remaining.length > 0) {
      items.push({ type: "text", text: remaining });
    }

    // Remove duplicates (exact text + url) while preserving order
    const seen = new Set();
    return items.filter(i => {
      const key = i.type === "link" ? `L|${i.text}|${i.url}` : `T|${i.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Robust extractSupportSections that captures the full connect block
  const extractSupportSections = (html) => {
    const sections = [];

    if (!html || typeof html !== "string") return sections;

    // 1) Contact block (exclude social icons)
    const contactRegex = /<b>\s*Contact our Customer Service team\s*<\/b>[\s\S]*?<hr class="faq-hr">/i;
    const contactMatch = html.match(contactRegex);
    if (contactMatch) {
      const contactHtml = contactMatch[0];

      // parseBlock on contactHtml but disallow social icon links
      const contactItems = parseBlock(contactHtml, { allowSocialLinks: false });

      sections.push({
        id: "support-contact",
        title: "Contact our Customer Service team",
        contentItems: contactItems,
        isExpanded: false,
        isSupportSection: true,
      });
    }

    // 2) Connect block (allow social icons). Capture from title until next hr.
    const connectRegex = /<b>\s*Connect with us & know our offers early\s*<\/b>[\s\S]*?<hr class="faq-hr">/i;
    const connectMatch = html.match(connectRegex);
    if (connectMatch) {
      const connectHtmlFull = connectMatch[0];

      // Usually the social links are in the paragraph AFTER the title.
      // Try to extract the <p> that contains the <a> tags (social links).
      const innerLinksMatch = connectHtmlFull.match(/<p[^>]*>([\s\S]*?)<\/p>\s*<hr class="faq-hr">/i);
      let connectInner = "";

      if (innerLinksMatch && innerLinksMatch[1]) {
        connectInner = innerLinksMatch[1];
      } else {
        // fallback: parse the whole captured block
        connectInner = connectHtmlFull;
      }

      const connectItems = parseBlock(connectInner, { allowSocialLinks: true });

      sections.push({
        id: "support-connect",
        title: "Connect with us & know our offers early",
        contentItems: connectItems,
        isExpanded: false,
        isSupportSection: true,
      });
    }

    // 3) Outlets & Booklets block (leave default parsing)
    const outletsRegex = /<div class="faq-div-flex">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i;
    const outletsMatch = html.match(outletsRegex);
    if (outletsMatch && outletsMatch[1]) {
      const outletsHtml = outletsMatch[1];
      const outletsItems = parseBlock(outletsHtml, { allowSocialLinks: true }); // links here are fine
      sections.push({
        id: "support-outlets",
        title: "Our Outlets & Promotion Booklets",
        contentItems: outletsItems,
        isExpanded: false,
        isSupportSection: true,
      });
    }

    return sections;
  };



  const toggleSection = async (sectionId) => {
    const section = faqSections.find(s => s.id === sectionId);

    // Support section → expand/collapse only
    if (section?.isSupportSection) {
      setExpandedSection(expandedSection === sectionId ? null : sectionId);
      return;
    }

    // Normal FAQ logic...
    if (expandedSection === sectionId) {
      setExpandedSection(null);
      return;
    }

    setExpandedSection(sectionId);

    if (section && section.items && section.items.length > 0) {
      return;
    }

    try {
      setLoading(true);
      const response = await pageServices.GetStaticPage(sectionId);

      if (response.data) {
        const faqItems = parseFAQContent(response.data);

        const updatedSections = faqSections.map((sec) =>
          sec.id === sectionId
            ? { ...sec, items: faqItems, isExpanded: true }
            : sec
        );

        setFaqSections(updatedSections);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading FAQ content:", error);
      setLoading(false);
    }
  };

  const handleLinkPress = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Cannot open URL:", url);
      }
    } catch (error) {
      console.error("Error opening link:", error);
    }
  };

  const renderFAQSection = (section) => (
    <View key={section.id} style={styles.sectionContainer}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(section.id)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>

        <Text style={styles.expandIcon}>
          {expandedSection === section.id ? '−' : '+'}
        </Text>
      </TouchableOpacity>
      
      {expandedSection === section.id && (
        <View style={styles.sectionContent}>
          {section.contentItems ? (
            // Render support section with structured content
            <View style={styles.faqItem}>
              {section.contentItems.map((contentItem, index) => (
                <View key={index} style={styles.contentItemContainer}>
                  {contentItem.type === 'text' ? (
                    <Text style={styles.answerText} numberOfLines={0}>{contentItem.text}</Text>
                  ) : contentItem.type === 'link' ? (
                    <TouchableOpacity
                      onPress={() => handleLinkPress(contentItem.url)}
                      style={styles.linkButton}
                    >
                      <Text style={styles.linkText}>{contentItem.text}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
            </View>
          ) : section.items ? (
            // Render normal FAQ items
            section.items.map((item, index) => (
              <View key={index} style={styles.faqItem}>
                {item.question ? <Text style={styles.questionText}>{item.question}</Text> : null}
                <Text style={styles.answerText}>{item.answer}</Text>
              </View>
            ))
          ) : null}
        </View>
      )}
    </View>
  );

  const renderNoDataMessage = () => (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataTitle}>{t("no_faq_data_available")}</Text>
      <Text style={styles.noDataText}>{t("we_are_unable_to_load_faq_information_at_the_moment")}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.indicatorContainer}>
            <ActivityIndicator size="large" color="#1D9ADC" />
          </View>
        ) : (
          <View style={styles.card}>
            {faqSections && faqSections.length > 0 ? (
              <>
                {/* Dynamic FAQ Sections from API */}
                {faqSections.map((section) => renderFAQSection(section))}
              </>
            ) : (
              /* No Data Message */
              renderNoDataMessage()
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: hp("2%"),
  },
  indicatorContainer: {
    height: hp("80%"),
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: wp("100%"),
    backgroundColor: "#fff",
    paddingHorizontal: wp("4%"),
    paddingTop: hp("1%"),
    borderRadius: 8,
  },
  sectionContainer: {
    marginBottom: hp("0.5%"),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("3%"),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
    minHeight: hp("6%"),
  },
  sectionTitle: {
    fontSize: RFValue(15.5, 812),
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    flex: 1,
    lineHeight: RFValue(22, 812),
    paddingRight: wp("3%"),
  },
  expandIcon: {
    fontSize: RFValue(24, 812),
    color: "#666",
    marginLeft: wp("2%"),
    minWidth: wp("6%"),
    textAlign: "center",
  },
  sectionContent: {
    backgroundColor: "#fafafa",
  },
  faqItem: {
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  questionText: {
    fontSize: RFValue(14.5, 812),
    fontFamily: "Poppins-Medium",
    color: "#444",
    marginBottom: hp("0.8%"),
    lineHeight: RFValue(22, 812),
  },
  answerText: {
    fontSize: RFValue(11, 812),
    fontFamily: "Poppins-Regular",
    color: "#555",
    lineHeight: RFValue(18, 812),
  },
  contentItemContainer: {
    marginBottom: hp("0.8%"),
  },
  textWithLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  linksContainer: {
    marginTop: hp("1%"),
    gap: hp("0.8%"),
  },
  linkButton: {
    paddingVertical: hp("0.5%"),
  },
  linkText: {
    fontSize: RFValue(14, 812),
    fontFamily: "Poppins-Medium",
    color: "#1D9ADC",
    lineHeight: RFValue(22, 812),
  },
  
  // Contact Section Styles
  contactSection: {
    marginTop: hp("1.5%"),
    paddingHorizontal: wp("4%"),
    paddingBottom: hp("2%"),
  },
  contactTitle: {
    fontSize: RFValue(15.5, 812),
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    marginBottom: hp("0.5%"),
    lineHeight: RFValue(22, 812),
  },
  contactSubtitle: {
    fontSize: RFValue(14, 812),
    fontFamily: "Poppins-Regular",
    color: "#555",
    marginBottom: hp("0.8%"),
    lineHeight: RFValue(21, 812),
  },
  contactNote: {
    fontSize: RFValue(13, 812),
    fontFamily: "Poppins-Regular",
    color: "#666",
    lineHeight: RFValue(20, 812),
  },
  
  // No Data Styles
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("5%"),
    paddingHorizontal: wp("8%"),
    minHeight: hp("40%"),
  },
  noDataTitle: {
    fontSize: RFValue(17, 812),
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    marginBottom: hp("1%"),
    textAlign: "center",
  },
  noDataText: {
    fontSize: RFValue(14, 812),
    fontFamily: "Poppins-Regular",
    color: "#666",
    lineHeight: RFValue(22, 812),
    textAlign: "center",
  },
});

export default CustomFAQs;