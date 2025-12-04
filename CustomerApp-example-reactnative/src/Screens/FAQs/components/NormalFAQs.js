import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import { useTranslation } from "react-i18next";
import CustomHeader from "../../../component/CustomHeader";
import CommonHeaderRight from "../../../component/CommonHeaderRight";
import pageServices from "../../../services/pageServices";
import CommonHeaderLeft from "../../../component/CommonHeaderLeft";

const client = process.env.CLIENT;

const NormalFAQs = (props) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [faqSections, setFaqSections] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation, route, options }) => (
        <CustomHeader
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
      parseFAQData(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("FAQs Data fetching failed:", error);
    }
  };

  const parseFAQData = (htmlData) => {
    try {
      // console.log("Parsing FAQ data:", typeof htmlData, htmlData);
      
      // If the API returns structured JSON data
      if (typeof htmlData === 'object' && htmlData.sections) {
        setFaqSections(htmlData.sections);
        return;
      }

      // If the API returns HTML content, we'll parse it
      const sections = [];
      
      if (typeof htmlData === 'string' && htmlData.trim()) {
        // Try to parse HTML content and extract FAQ structure
        const htmlString = htmlData;
        
        // Look for common FAQ patterns in HTML
        // Pattern 1: Look for h3, h4 headers followed by content
        const headerPattern = /<h[3-6][^>]*>(.*?)<\/h[3-6]>/gi;
        const headers = [];
        let match;
        
        while ((match = headerPattern.exec(htmlString)) !== null) {
          headers.push({
            title: match[1].replace(/<[^>]*>/g, '').trim(),
            position: match.index
          });
        }
        
        if (headers.length > 0) {
          // Create sections based on headers
          headers.forEach((header, index) => {
            const nextHeaderPosition = headers[index + 1] ? headers[index + 1].position : htmlString.length;
            const sectionContent = htmlString.substring(header.position, nextHeaderPosition);
            
            // Extract Q&A pairs from this section
            const items = extractQAPairs(sectionContent);
            
            if (items.length > 0) {
              sections.push({
                id: index + 1,
                title: header.title,
                items: items,
                isExpanded: false
              });
            }
          });
        } else {
          // Fallback: Create a single section with all content
          const cleanText = htmlString.replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (cleanText) {
            // Try to split content into logical Q&A pairs
            const items = extractQAPairs(htmlString) || [{
              question: "FAQ Information",
              answer: cleanText
            }];
            
            sections.push({
              id: 1,
              title: "Frequently Asked Questions",
              items: items,
              isExpanded: false
            });
          }
        }
      }
      
      setFaqSections(sections);
    } catch (error) {
      console.error("Error parsing FAQ data:", error);
      // Fallback: create a simple structure
      const fallbackContent = typeof data === 'string' ? 
        data.replace(/<[^>]*>/g, ' ').trim() : 
        "FAQ information is currently unavailable.";
        
      setFaqSections([{
        id: 1,
        title: "FAQs",
        items: [{
          question: "Information",
          answer: fallbackContent
        }],
        isExpanded: false
      }]);
    }
  };

  const extractQAPairs = (htmlContent) => {
    const items = [];
    
    // Pattern 1: Look for strong/bold tags followed by content (common FAQ format)
    const boldPattern = /<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>(.*?)(?=<(?:strong|b)|$)/gi;
    let match;
    
    while ((match = boldPattern.exec(htmlContent)) !== null) {
      const question = match[1].replace(/<[^>]*>/g, '').trim();
      const answer = match[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      if (question && answer) {
        items.push({ question, answer });
      }
    }
    
    // Pattern 2: Look for paragraph patterns
    if (items.length === 0) {
      const paragraphs = htmlContent.split(/<\/?p[^>]*>/i).filter(p => p.trim());
      
      for (let i = 0; i < paragraphs.length; i += 2) {
        const question = paragraphs[i] ? paragraphs[i].replace(/<[^>]*>/g, '').trim() : '';
        const answer = paragraphs[i + 1] ? paragraphs[i + 1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
        
        if (question && answer) {
          items.push({ question, answer });
        }
      }
    }
    
    return items;
  };

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const renderFAQSection = (section) => (
    <View key={section.id} style={styles.sectionContainer}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(section.id)}
      >
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.expandIcon}>
          {expandedSection === section.id ? '−' : '+'}
        </Text>
      </TouchableOpacity>
      
      {expandedSection === section.id && (
        <View style={styles.sectionContent}>
          {section.items && section.items.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.questionText}>{item.question}</Text>
              <Text style={styles.answerText}>{item.answer}</Text>
            </View>
          ))}
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

  const renderContactInfo = () => {
    // This can be moved to a separate API call or configuration
    return (
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Need More Help?</Text>
        <Text style={styles.contactSubtitle}>Contact our Customer Service team</Text>
        <Text style={styles.contactNote}>
          For additional support, please reach out to our customer service team through the app's contact section.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
                
                {/* Contact Information */}
                {renderContactInfo()}
              </>
            ) : (
              /* No Data Message */
              renderNoDataMessage()
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    paddingBottom: hp("1.5%"),
  },
  indicatorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: hp("80%"),
  },
  card: {
    width: wp("100%"),
    backgroundColor: "#fff",
    paddingHorizontal: wp("3%"),
    paddingTop: hp("0.5%.2%"),
    backgroundColor: "#fff",
    borderRadius: 4,
    overflow: "hidden",
    
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp("2.8%"),
    paddingHorizontal: wp("4%"),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: RFValue(15),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    flex: 1,
    
    lineHeight: RFValue(18),
  },
  expandIcon: {
    fontSize: RFValue(18),
    fontWeight: "300",
    color: "#666",
    marginLeft: wp("2%"),
  },
  sectionContent: {
    backgroundColor: "#fafafa",
  },
  faqItem: {
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("0.5%"),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  questionText: {
    fontSize: RFValue(14),
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#444",
    marginBottom: hp("0.2%"),
    lineHeight: RFValue(16),
  },
  answerText: {
    fontSize: RFValue(13),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#666",
    lineHeight: RFValue(15),
    textAlign: "justify",
  },
  
  // Contact Section Styles
  contactSection: {
    marginTop: hp("1%"),
    paddingHorizontal: wp("3%"),
    paddingBottom: hp("1%"),
  },
  contactTitle: {
    fontSize: RFValue(15),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    marginBottom: hp("0.3%"),
    lineHeight: RFValue(18),
  },
  contactSubtitle: {
    fontSize: RFValue(13),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#555",
    marginBottom: hp("0.5%"),
    lineHeight: RFValue(16),
  },
  contactNote: {
    fontSize: RFValue(12),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#666",
    lineHeight: RFValue(15),
    textAlign: "justify",
  },
  
  // No Data Styles
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("3%"),
    paddingHorizontal: wp("6%"),
  },
  noDataTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    marginBottom: hp("1.5%"),
    textAlign: "center",
  },
  noDataText: {
    fontSize: RFValue(14),
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    color: "#666",
    lineHeight: RFValue(20),
    textAlign: "center",
  },
});

export default NormalFAQs;