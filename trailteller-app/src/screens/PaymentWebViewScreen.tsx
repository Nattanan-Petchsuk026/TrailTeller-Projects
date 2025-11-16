import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

export default function PaymentWebViewScreen({ route, navigation }: any) {
  const { paymentUrl, tripId, onComplete } = route.params;
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadTimeout, setLoadTimeout] = React.useState(false);

  // ✅ ตั้ง Timeout 30 วินาที
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setLoadTimeout(true);
        Alert.alert(
          'หน้าโหลดนาน',
          'หน้าชำระเงินโหลดนานเกินไป\n\nต้องการลองใหม่หรือไม่?',
          [
            {
              text: 'ยกเลิก',
              onPress: () => navigation.goBack(),
              style: 'cancel',
            },
            {
              text: 'ลองใหม่',
              onPress: () => {
                setIsLoading(true);
                setLoadTimeout(false);
              },
            },
          ]
        );
      }
    }, 30000); // 30 วินาที

    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleNavigationChange = (navState: any) => {
    const { url } = navState;
    
    console.log('🔗 WebView URL:', url);

    // ✅ ตรวจสอบ Success URL
    if (url.includes('payment-success') || url.includes('mytrip://payment-success')) {
      Alert.alert(
        '✅ ชำระเงินสำเร็จ',
        'การจองของคุณได้รับการยืนยันแล้ว\n\nสถานะจะอัปเดตอัตโนมัติภายใน 1-2 นาที',
        [
          {
            text: 'ดูทริป',
            onPress: () => {
              navigation.popToTop();
              if (onComplete) {
                onComplete();
              } else {
                navigation.navigate('TripDetail', { tripId });
              }
            }
          }
        ]
      );
      return;
    }

    // ✅ ตรวจสอบ Cancel URL
    if (url.includes('payment-cancel') || url.includes('cancel')) {
      Alert.alert(
        '❌ ยกเลิกการชำระเงิน',
        'การจองของคุณยังอยู่ในสถานะ "รอชำระเงิน"\n\nคุณสามารถชำระเงินภายหลังได้จากหน้ารายละเอียดทริป',
        [
          {
            text: 'ตกลง',
            onPress: () => {
              navigation.popToTop();
              navigation.navigate('TripDetail', { tripId });
            }
          }
        ]
      );
    }
  };

  const handleClose = () => {
    Alert.alert(
      'ยกเลิกการชำระเงิน?',
      'คุณต้องการยกเลิกการชำระเงินหรือไม่?\n\nการจองจะยังคงอยู่ในสถานะ "รอชำระเงิน"',
      [
        { text: 'ชำระเงินต่อ', style: 'cancel' },
        {
          text: 'ยกเลิก',
          style: 'destructive',
          onPress: () => {
            navigation.popToTop();
            navigation.navigate('TripDetail', { tripId });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ✅ ปุ่มปิด */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={24} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ชำระเงิน</Text>
        <View style={{ width: 40 }} />
      </View>

      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#0066FF" />
            <Text style={styles.loadingText}>กำลังโหลดหน้าชำระเงิน...</Text>
          </View>
        )}
        // ✅ รองรับ Deep Link
        onShouldStartLoadWithRequest={(request) => {
          if (request.url.startsWith('mytrip://')) {
            return false; // ไม่ให้ WebView load, ให้ handler จัดการแทน
          }
          return true;
        }}
        // ✅ จัดการ Error
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('❌ WebView Error:', nativeEvent);
          Alert.alert(
            'ข้อผิดพลาด',
            'ไม่สามารถโหลดหน้าชำระเงินได้\n\nกรุณาลองใหม่อีกครั้ง',
            [
              {
                text: 'ปิด',
                onPress: () => navigation.goBack()
              }
            ]
          );
        }}
        // ✅ จัดการ HTTP Error
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('❌ HTTP Error:', nativeEvent.statusCode);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 999, // ✅ ให้แสดงข้างหน้า WebView
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
});