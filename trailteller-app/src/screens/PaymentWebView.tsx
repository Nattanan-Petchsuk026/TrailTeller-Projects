/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { checkPaymentStatus } from '../api/payment';
import { useNavigation } from '@react-navigation/native';

const PaymentWebView = ({ route }: any) => {
  const { url, paymentIntentId } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleNavigationChange = async (navState: any) => {
    const { url: currentUrl } = navState;

    // ✅ ตรวจสอบเมื่อผู้ใช้ถูก redirect กลับมาที่ return_uri
    if (currentUrl.includes('/payment-result')) {
      setLoading(true);
      try {
        const result = await checkPaymentStatus(paymentIntentId);
        console.log('💳 Payment status:', result);

        if (result.data.paid) {
          Alert.alert('ชำระเงินสำเร็จ ✅', 'การจองของคุณได้รับการยืนยันแล้ว', [
            {
              text: 'ตกลง',
              onPress: () => (navigation as any).navigate('Home'),
            },
          ]);
        } else {
          Alert.alert('การชำระเงินล้มเหลว ❌', 'กรุณาลองใหม่อีกครั้ง', [
            { text: 'ตกลง', onPress: () => navigation.goBack() },
          ]);
        }
      } catch (error: any) {
        console.error('❌ ตรวจสอบสถานะไม่สำเร็จ:', error);
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถตรวจสอบการชำระเงินได้');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#009688" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 10,
  },
});

export default PaymentWebView;