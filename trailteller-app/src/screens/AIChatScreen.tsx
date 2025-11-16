import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ChevronLeft, 
  Send, 
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Compass,
} from 'lucide-react-native';
import { chatWithAI } from '../api/ai';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'suggestion';
}

// Quick suggestion chips
const QUICK_SUGGESTIONS = [
  { icon: MapPin, text: 'แนะนำที่เที่ยวใกล้ฉัน', color: '#0066FF' },
  { icon: Calendar, text: 'แนะนำช่วงเวลาเที่ยว', color: '#10B981' },
  { icon: DollarSign, text: 'เที่ยวงบประมาณ 10,000', color: '#F59E0B' },
  { icon: Compass, text: 'จุดหมายยอดนิยม', color: '#8B5CF6' },
];

export default function AIChatScreen({ navigation }: any) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'สวัสดีครับ! 👋\n\nผม TrailTeller AI พร้อมช่วยวางแผนการเดินทางของคุณ',
      isUser: false,
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend || loading) return;

    // Hide suggestions after first message
    setShowSuggestions(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    inputRef.current?.clear();
    Keyboard.dismiss();
    setLoading(true);

    try {
      const response = await chatWithAI({ message: textToSend });
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data?.response || 'ขออภัยครับ ไม่สามารถตอบคำถามได้',
        isUser: false,
        timestamp: new Date(),
        type: 'text',
      };

      setMessages((prev) => [...prev, aiMessage]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Chat error:', error.response?.data || error.message);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'ขอโทษครับ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง 🙏',
        isUser: false,
        timestamp: new Date(),
        type: 'text',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const parseMessageContent = (text: string) => {
    // Parse message into structured sections
    const lines = text.split('\n').filter(line => line.trim());
    const sections: Array<{type: string; content: string; icon?: any}> = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.includes('📍') || trimmed.includes('🏛️') || trimmed.includes('🏖️')) {
        sections.push({ type: 'location', content: trimmed.replace(/[📍🏛️🏖️]/g, '').trim(), icon: MapPin });
      } else if (trimmed.includes('💰') || trimmed.includes('💵')) {
        sections.push({ type: 'price', content: trimmed.replace(/[💰💵]/g, '').trim(), icon: DollarSign });
      } else if (trimmed.includes('🕒') || trimmed.includes('⏰')) {
        sections.push({ type: 'time', content: trimmed.replace(/[🕒⏰]/g, '').trim(), icon: Clock });
      } else if (trimmed.includes('📅') || trimmed.includes('🗓️')) {
        sections.push({ type: 'date', content: trimmed.replace(/[📅🗓️]/g, '').trim(), icon: Calendar });
      } else {
        sections.push({ type: 'text', content: trimmed });
      }
    });

    return sections;
  };

  const renderMessageBubble = ({ item }: { item: Message }) => {
    if (item.isUser) {
      return (
        <View style={styles.userMessageContainer}>
          <View style={styles.userBubble}>
            <Text style={styles.userMessageText}>{item.text}</Text>
            <Text style={styles.userTimestamp}>
              {item.timestamp.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      );
    }

    // AI Message with structured content
    const sections = parseMessageContent(item.text);
    const hasStructuredContent = sections.some(s => s.type !== 'text');

    return (
      <View style={styles.aiMessageContainer}>
        <View style={styles.aiAvatarContainer}>
          <LinearGradient
            colors={['#0066FF', '#0047B3']}
            style={styles.aiAvatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Sparkles size={16} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
        </View>

        <View style={styles.aiContentContainer}>
          <View style={styles.aiBubble}>
            {hasStructuredContent ? (
              <View style={styles.structuredContent}>
                {sections.map((section, idx) => {
                  if (section.type === 'text') {
                    return (
                      <Text key={idx} style={styles.aiMessageText}>
                        {section.content}
                      </Text>
                    );
                  }

                  const Icon = section.icon;
                  return (
                    <View key={idx} style={styles.infoCard}>
                      <View style={styles.infoIconContainer}>
                        <Icon size={16} color="#0066FF" strokeWidth={2} />
                      </View>
                      <Text style={styles.infoText}>{section.content}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.aiMessageText}>{item.text}</Text>
            )}
            
            <Text style={styles.aiTimestamp}>
              {item.timestamp.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSuggestions = () => {
    if (!showSuggestions || messages.length > 1) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>💡 คำถามยอดนิยม</Text>
        <View style={styles.suggestionsGrid}>
          {QUICK_SUGGESTIONS.map((suggestion, idx) => {
            const Icon = suggestion.icon;
            return (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionChip}
                onPress={() => sendMessage(suggestion.text)}
              >
                <LinearGradient
                  colors={[suggestion.color, suggestion.color + 'DD']}
                  style={styles.suggestionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon size={18} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.suggestionText}>{suggestion.text}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0066FF', '#0047B3'] as const}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <View style={styles.headerAvatarSmall}>
              <Sparkles size={16} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.headerTitle}>AI ผู้ช่วย</Text>
              <Text style={styles.headerSubtitle}>พร้อมให้บริการตลอด 24 ชม.</Text>
            </View>
          </View>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageBubble}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListFooterComponent={renderSuggestions}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View style={styles.typingIndicator}>
          <View style={styles.typingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
          <Text style={styles.typingText}>กำลังพิมพ์...</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="พิมพ์ข้อความ..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || loading}
            >
              <LinearGradient
                colors={
                  !inputText.trim()
                    ? ['#E2E8F0', '#CBD5E1']
                    : (['#0066FF', '#0047B3'] as const)
                }
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Send size={20} color="#FFFFFF" strokeWidth={2.5} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  headerGradient: {
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerRight: {
    width: 40,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: '#0066FF',
    borderRadius: 20,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  userMessageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  userTimestamp: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 6,
    textAlign: 'right',
  },
  aiMessageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  aiAvatarContainer: {
    marginRight: 8,
    marginTop: 4,
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiContentContainer: {
    flex: 1,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  structuredContent: {
    gap: 12,
  },
  aiMessageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#0F172A',
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  aiTimestamp: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },
  suggestionsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  suggestionsGrid: {
    gap: 8,
  },
  suggestionChip: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  suggestionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },
  typingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    maxHeight: 100,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    fontWeight: '500',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});