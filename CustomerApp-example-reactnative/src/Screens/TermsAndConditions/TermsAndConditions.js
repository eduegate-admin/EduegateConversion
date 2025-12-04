import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import RenderHTML from 'react-native-render-html';
import pageServices from '../../services/pageServices';
import CustomHeader from '../../component/CustomHeader';
import CommonHeaderLeft from '../../component/CommonHeaderLeft';
import CommonHeaderRight from '../../component/CommonHeaderRight';
import { useTranslation } from 'react-i18next';
import appSettings from '../../../Client/appSettings';

const client = process.env.CLIENT;

const TermsAndConditions = ({ route }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState(null);
  const conditionalHeaderProps = appSettings[client]?.conditionalHeaderProps;

  const {
    userLanguage = 'en',
    termsIDEn: routeTermsIDEn,
    termsIDAr: routeTermsIDAr,
    content: staticContent,
  } = route.params || {};

  const termsIDEn = routeTermsIDEn ?? appSettings[client]?.TermsIDEn;
  const termsIDAr = routeTermsIDAr ?? appSettings[client]?.TermsIDAr;

  // console.log('Client:', client);
  // console.log('Route params:', { userLanguage, routeTermsIDEn, routeTermsIDAr, hasStaticContent: !!staticContent });
  // console.log('Resolved Terms IDs:', { termsIDEn, termsIDAr, fromSettings: appSettings[client]?.TermsIDEn });

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation: nav }) =>
        conditionalHeaderProps ? (
          <CustomHeader
            title={t('terms_and_conditions')}
            leftComponent={<CommonHeaderLeft type="back" />}
            elevation={0}
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
            backgroundColor={appSettings[client]?.backgroundColor || '#12a14f'}
            showCustomIcons={true}
            hideicon={true}
            color="#FFFFFF"
            rightComponent={<CommonHeaderRight />}
          />
        ) : (
          <CustomHeader
            title={t('terms_and_conditions')}
            leftComponent={<CommonHeaderLeft type="back" />}
            color="#000000"
            elevation={1}
            rightComponent={<CommonHeaderRight />}
          />
        ),
    });
    loadPage();
  }, [t, userLanguage, termsIDEn, termsIDAr, navigation, staticContent]);

  const loadPage = async () => {
    try {
      // console.log('loadPage: Starting...');
      setLoading(true);

      if (staticContent) {
        // console.log('loadPage: Using static content');
        setHtml(staticContent);
        setLoading(false);
        return;
      }

      const id = userLanguage === 'ar' ? termsIDAr : termsIDEn;
      // console.log('loadPage: Selected page ID:', id, 'for language:', userLanguage);

      if (!id) {
        console.warn('loadPage: No page ID provided for client:', client);
        setHtml('<p style="font-size:16px;color:#555;">Terms & Conditions are not configured for this client. Please contact support.</p>');
        setLoading(false);
        return;
      }

      // console.log('loadPage: Calling GetStaticPage with ID:', id);
      const response = await pageServices.GetStaticPage(id);
      // console.log('loadPage: Response status:', response?.status, 'length:', response?.data?.length);

      const htmlData = response?.data ?? '';
      setHtml(htmlData || '<p style="font-size:16px;color:#555;">No content found.</p>');
    } catch (error) {
      console.error('TermsAndConditions GetStaticPage failed:', error);
      setHtml('<p style="font-size:16px;color:#c00;">Unable to load content. Please try again later.</p>');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: hp('5%'),
          alignItems: 'center',
        }}
      >
        {loading ? (
          <View style={styles.indicatorContainer}>
            <ActivityIndicator size="large" color="#1D9ADC" />
          </View>
        ) : (
          html && (
            <View style={styles.card}>
              <View style={styles.divider}>
                <RenderHTML
                  contentWidth={widthPercentageToDP('100%')}
                  source={{ html }}
                  tagsStyles={{
                    body: {
                      fontFamily: 'Poppins-Regular',
                      color: '#222',
                      lineHeight: 26,
                    },
                    p: {
                      fontSize: 16,
                      textAlign: 'justify',
                      fontWeight: '400',
                      fontFamily: 'Poppins-Regular',
                      color: '#222',
                      lineHeight: 26,
                      marginTop: 4,
                      marginBottom: 12,
                      letterSpacing: 0.2,
                    },
                    h1: {
                      fontSize: 24,
                      fontWeight: '600',
                      fontFamily: 'Poppins-SemiBold',
                      marginTop: 4,
                      marginBottom: 16,
                      textAlign: 'left',
                      color: '#111',
                      letterSpacing: 0.3,
                    },
                    h2: {
                      fontSize: 20,
                      fontWeight: '600',
                      fontFamily: 'Poppins-SemiBold',
                      marginTop: 24,
                      marginBottom: 12,
                      textAlign: 'left',
                      color: '#111',
                    },
                    h3: {
                      fontSize: 18,
                      fontWeight: '500',
                      fontFamily: 'Poppins-Medium',
                      marginTop: 20,
                      marginBottom: 10,
                      textAlign: 'left',
                      color: '#222',
                    },
                    ul: {
                      paddingLeft: 0,
                      marginLeft: 0,
                      marginBottom: 18,
                    },
                    ol: {
                      paddingLeft: 0,
                      marginLeft: 0,
                      marginBottom: 18,
                    },
                    li: {
                      fontSize: 15,
                      lineHeight: 24,
                      marginBottom: 8,
                      paddingLeft: 24,
                      position: 'relative',
                      fontFamily: 'Poppins-Regular',
                      color: '#333',
                    },
                    a: {
                      color: '#1D9ADC',
                      textDecorationLine: 'underline',
                      fontWeight: '500',
                    },
                    strong: {
                      fontFamily: 'Poppins-SemiBold',
                      fontWeight: '600',
                      color: '#111',
                    },
                  }}
                />
              </View>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  indicatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('100%'),
    height: hp('100%'),
  },
  card: {
    width: wp('91.11%'),
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: hp('2.5%'),
    marginBottom: hp('10%'),
    padding: wp('4.44%'),
    shadowColor: '#A5A5A5',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    borderWidth: 0.5,
    borderColor: '#eee',
  },
  divider: {
    borderTopWidth: 0,
    backgroundColor: '#fff',
    paddingTop: hp('2.5%'),
    marginBottom: hp('3%'),
  },
  description: {
    fontSize: RFValue(14),
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
    color: '#444',
    textAlign: 'justify',
  },
});

export default TermsAndConditions;