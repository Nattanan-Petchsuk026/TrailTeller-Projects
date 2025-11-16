import React, { useEffect } from 'react';
import { StatusBar, Linking, Alert } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    // ✅ ตั้งค่า Deep Link Listener สำหรับรับ callback จาก Omise
    const handleDeepLink = (event: { url: string }) => {
      console.log('🔗 App received deep link:', event.url);
      
      // ตรวจสอบ URL pattern
      if (event.url.includes('mytrip://payment-success')) {
        console.log('✅ Payment successful - deep link handled');
        // PaymentWebViewScreen จะจัดการ navigation
      } else if (event.url.includes('mytrip://payment-cancel')) {
        console.log('❌ Payment cancelled - deep link handled');
        // PaymentWebViewScreen จะจัดการ navigation
      }
    };

    // ฟัง Deep Link events เมื่อแอพเปิดอยู่
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // ตรวจสอบ Deep Link เมื่อแอพเปิดครั้งแรก (cold start)
    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          console.log('🔗 Initial deep link:', url);
          handleDeepLink({ url });
        }
      })
      .catch((err) => {
        console.error('❌ Error getting initial URL:', err);
      });

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </>
  );
}