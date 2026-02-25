import { useState, useRef, useEffect, Fragment } from 'react';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { hapticFeedback } from '../../utils/haptics';
import { apiService } from '../../services/api';
import { transferCoins } from '../../services/payment';
import {
  MessageCircle, Search, Send, Paperclip, X,
  Smile, MoreVertical, Info, CheckCheck,
  ArrowLeft, Shield, ChevronRight, Crown, Lock, Unlock,
  Bell, Gift, Trash2, Calendar, Clock as ClockIcon
} from 'lucide-react';

const SYSTEM_USER_ID = '6989549ede1ca80e285692a8';


interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'file';
  isLocked?: boolean;
  price?: number;
  isUnlocked?: boolean;
  isSystem?: boolean;
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  online: boolean;
  premium: boolean;
  role?: string;
  priceList?: any[];
  verified?: boolean;
  coins?: number;
}



interface MessagingProps {
  currentUser: User;
  onBack: () => void;
  targetUserId?: string | null;
  targetUser?: User | null;
  targetAdId?: string | null;
  onTargetUserCleared?: () => void;
}


// Transform backend conversation data to frontend format
const transformConversation = (data: any): Conversation => {
  // Use backend online flags directly
  const isOnline = data.partner.isOnline === true || data.partner.online === true;

  return {
    id: data.partner._id,
    userId: data.partner._id,
    userName: data.partner.name || 'Usuario',
    userAvatar: data.partner.avatar || `https://ui-avatars.com/api/?name=${data.partner.name || 'User'}`,
    lastMessage: data.lastMessage?.content || '',
    lastMessageTime: new Date(data.lastMessage?.createdAt || Date.now()),
    unreadCount: data.unreadCount || 0,
    online: isOnline,
    premium: !!data.partner.premium,
    role: data.partner.role,
    priceList: data.partner.priceList,
    verified: data.partner.verified,
    coins: data.partner.wallet?.coins || 0
  };
};

// Transform backend message data to frontend format
const transformMessage = (data: any): Message => ({
  id: data._id,
  senderId: data.sender,
  receiverId: data.recipient,
  content: String(data.content), // Ensure content is string
  read: data.isRead,
  timestamp: new Date(data.createdAt),
  type: data.type || 'text',
  isSystem: !!data.isSystem || data.sender === SYSTEM_USER_ID,
  isLocked: data.isLocked,
  price: data.price,
  isUnlocked: data.isUnlocked
});


export function Messaging({ currentUser, onBack, targetUserId, targetUser, targetAdId, onTargetUserCleared }: MessagingProps) {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();

  // Helper to get robust User ID
  const getCurrentUserId = () => {
    return currentUser.uid || currentUser.id || (currentUser as any)._id;
  };

  const currentUserId = getCurrentUserId();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [showPriceList, setShowPriceList] = useState(false);
  const [showGiftMenu, setShowGiftMenu] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    date: '',
    time: '',
    location: '',
    details: ''
  });
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);
  const [showAnimation, setShowAnimation] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const PREDEFINED_GIFTS = [
    { id: 'rose', label: 'Rosa', icon: '🌹', price: 10 },
    { id: 'chocolate', label: 'Chocolates', icon: '🍫', price: 50 },
    { id: 'bear', label: 'Oso', icon: '🧸', price: 100 },
    { id: 'diamond', label: 'Diamante', icon: '💎', price: 500 },
    { id: 'car', label: 'Auto de Lujo', icon: '🏎️', price: 1000 },
    { id: 'castle', label: 'Castillo', icon: '🏰', price: 5000 },
  ];

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const res = await apiService.getConversations() as any;
        let mappedConvs = [];
        if (res.data.success && res.data.data) {
          mappedConvs = res.data.data.map(transformConversation);
        }

        // Always add System Chat at the top
        const systemConv: Conversation = {
          id: SYSTEM_USER_ID,
          userId: SYSTEM_USER_ID,
          userName: 'Notificaciones SafeConnect',
          userAvatar: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png',
          lastMessage: 'Bienvenido al centro de notificaciones',
          lastMessageTime: new Date(),
          unreadCount: 0,
          online: true,
          premium: false
        };

        setConversations([systemConv, ...mappedConvs.filter((c: Conversation) => c.id !== SYSTEM_USER_ID)]);
      } catch (err) {
        console.error('Error cargando conversaciones:', err);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    // Reset appointment modal state
    setShowAppointmentModal(false);
    setAppointmentForm({ date: '', time: '', location: '', details: '' });
    // Don't reset selectedAdId here as it might be set by targetAdId or conversation context

    if (!activeConversation) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const res = await apiService.getMessages(activeConversation.userId) as any;
        if (res.data.success && res.data.data) {
          let mappedMsgs = res.data.data.map(transformMessage);

          if (activeConversation.userId === SYSTEM_USER_ID && mappedMsgs.length === 0) {
            mappedMsgs = [{
              id: 'system-welcome',
              senderId: SYSTEM_USER_ID,
              receiverId: currentUserId,
              content: 'Bienvenido al centro de notificaciones oficiales de SafeConnect. Aquí recibirás avisos sobre tus transacciones, ventas y seguridad.',
              timestamp: new Date(),
              read: true,
              type: 'text'
            }];
          }

          setMessages(mappedMsgs);

        }
      } catch (err) {
        console.error('Error cargando mensajes:', err);
      }
    };
    loadMessages();
  }, [activeConversation, currentUser.role]);

  // Page Visibility API - detect when tab is active/inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Auto-open conversation if targetUserId is provided
  useEffect(() => {
    // Only proceed if loading is done
    if (loading) return;

    if (targetUserId) {
      const targetConv = conversations.find(c => c.userId === targetUserId);
      if (targetConv) {
        // Conversation exists, open it
        setActiveConversation(targetConv);
        if (targetAdId) setSelectedAdId(targetAdId);
      } else if (targetUser) {
        // No conversation exists, create temporary one
        const tempConv: Conversation = {
          id: `temp-${targetUserId}`,
          userId: targetUser.uid || targetUser.id || targetUserId,
          userName: targetUser.name || targetUser.displayName || 'Usuario',
          userAvatar: targetUser.avatar || targetUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser.name || 'Usuario')}&background=random`,
          lastMessage: 'Nueva conversación',
          lastMessageTime: new Date(),
          unreadCount: 0,
          online: (targetUser.isOnline === true || targetUser.online === true) ||
            (!!(targetUser.lastSeen || targetUser.updatedAt) && (Date.now() - new Date(targetUser.lastSeen || targetUser.updatedAt || '').getTime() < 10 * 60 * 1000)),
          premium: targetUser.premium || targetUser.isVip || false,
          role: targetUser.role,
          priceList: targetUser.priceList
        };
        setActiveConversation(tempConv);
        setMessages([]); // Empty messages for new conversation
        if (targetAdId) setSelectedAdId(targetAdId);
      }
      // Clear the target after processing
      onTargetUserCleared?.();
    }
  }, [targetUserId, targetAdId, conversations, targetUser, onTargetUserCleared, loading]);

  // Smart Polling for real-time updates
  useEffect(() => {
    if (!isPageVisible) return; // Don't poll if tab is inactive

    // Adaptive polling: 2s if chatting, 10s if just viewing list
    const pollInterval = activeConversation ? 2000 : 10000;

    const interval = setInterval(async () => {
      try {
        // Reload conversations (for unread badges)
        const convRes = await apiService.getConversations() as any;
        if (convRes.data.success && convRes.data.data) {
          const mappedConvs = convRes.data.data.map(transformConversation);

          // Re-inject system chat
          const systemConv = {
            id: SYSTEM_USER_ID,
            userId: SYSTEM_USER_ID,
            userName: 'Notificaciones SafeConnect',
            userAvatar: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png',
            lastMessage: 'Bienvenido al centro de notificaciones',
            lastMessageTime: new Date(),
            unreadCount: 0,
            online: true,
            premium: false
          };

          const otherConvs = mappedConvs.filter((c: Conversation) => c.id !== SYSTEM_USER_ID);
          setConversations([systemConv, ...otherConvs]);

          // Sync active conversation status (online status)
          if (activeConversation && activeConversation.id !== SYSTEM_USER_ID) {
            const currentPartner = mappedConvs.find((c: Conversation) => c.userId === activeConversation.userId);
            if (currentPartner && currentPartner.online !== activeConversation.online) {
              setActiveConversation(prev => prev ? { ...prev, online: currentPartner.online } : null);
            }
          }
        }

        // Reload messages if in active conversation
        if (activeConversation) {
          const msgRes = await apiService.getMessages(activeConversation.userId) as any;
          if (msgRes.data.success && msgRes.data.data) {
            const backendMsgs = msgRes.data.data;

            // For system chat, prepend welcome if empty
            if (activeConversation.userId === SYSTEM_USER_ID && backendMsgs.length === 0) {
              setMessages(prev => {
                if (prev.length === 1 && prev[0].id === 'system-welcome') return prev;
                return [{
                  id: 'system-welcome',
                  senderId: SYSTEM_USER_ID,
                  receiverId: currentUserId,
                  content: 'Bienvenido al centro de notificaciones oficiales de SafeConnect.',
                  timestamp: new Date(),
                  read: true,
                  type: 'text'
                }];
              });
            } else {
              const mappedMsgs = backendMsgs.map(transformMessage);
              setMessages(mappedMsgs);
            }
          }
        }
      } catch (err) {
        console.error('Error during polling:', err);
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [activeConversation, isPageVisible, currentUserId]);

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    // Check if user is within 100px of bottom
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    isAtBottomRef.current = atBottom;
  };

  const scrollToBottom = (force = false) => {
    if (force || isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Scroll to bottom on initial load or when sending own message
    const lastMessage = messages[messages.length - 1];
    const isOwn = lastMessage?.senderId === currentUserId;

    if (messages.length > 0) {
      scrollToBottom(isOwn);
    }
  }, [messages.length]); // Only trigger when count changes

  const handleDeleteConversation = async () => {
    if (!activeConversation) return;

    if (confirm('¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.')) {
      try {
        const res = await apiService.deleteConversation(activeConversation.userId) as any;
        if (res.data.success) {
          setConversations(prev => prev.filter(c => c.userId !== activeConversation.userId));
          setActiveConversation(null);
          setMessages([]);
        }
      } catch (err) {
        console.error('Error eliminando conversación:', err);
        alert('No se pudo eliminar la conversación.');
      }
    }
  };

  const handleUnlock = async (msgId: string, price: number) => {
    if (!confirm(`¿Desbloquear este contenido por ${price} monedas?`)) return;

    try {
      const res = await transferCoins({
        recipientId: activeConversation?.userId,
        amount: price,
        reason: `Unlock content ${msgId}`,
        messageId: msgId
      }) as any;

      if (res.data.success) {
        // Optimistically unlock in UI
        setMessages(prev => prev.map(m =>
          m.id === msgId ? { ...m, isLocked: false, isUnlocked: true } : m
        ));

        // SEND NOTIFICATION TO ADVERTISER FROM SYSTEM
        try {
          await apiService.sendMessage(activeConversation?.userId || '',
            `📢 ¡VENTA REALIZADA! El usuario ${currentUser.name} ha comprado tu servicio por ${price} monedas. Por favor, realiza la entrega del contenido en este chat.`,
            { isLocked: false }
          );
          // Note: Ideally the backend would send this from 'system' sender, 
          // here we are sending it as current user but maybe we can trigger a system API if it existed.
          // For now, this lets the advertiser know.
        } catch (e) {
          console.error("Failed to send notification", e);
        }
      }
    } catch (err) {
      alert('Error al desbloquear. Verifica tu saldo.');
    }
  };

  const handleSendMessage = async (forceContent?: string, forceOptions?: { isLocked?: boolean; price?: number }) => {
    if ((!newMessage.trim() && !forceContent) || !activeConversation) return;

    const messageContent = forceContent || newMessage;
    if (!forceContent) setNewMessage(''); // Clear input immediately for better UX

    // Optimistic UI update - add message to UI immediately
    const optimisticMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: activeConversation.userId,
      content: messageContent,
      timestamp: new Date(),
      read: false,
      type: 'text',
      ...forceOptions
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Send message to backend
      await apiService.sendMessage(activeConversation.userId, messageContent, forceOptions);

      // Update conversation last message
      setConversations(convs =>
        convs.map(conv =>
          conv.id === activeConversation.id
            ? { ...conv, lastMessage: messageContent, lastMessageTime: new Date() }
            : conv
        )
      );

      // Reload messages to get the real message with proper ID from backend
      const res = await apiService.getMessages(activeConversation.userId) as any;
      if (res.data.success && res.data.data) {
        const mappedMsgs = res.data.data.map(transformMessage);
        setMessages(mappedMsgs);
      }
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      if (!forceContent) setNewMessage(messageContent); // Restore message text
      alert('No se pudo enviar el mensaje. Por favor intenta de nuevo.');
    }
  };

  const handleSendGift = async (gift: any) => {
    if (!confirm(`¿Enviar ${gift.label} por ${gift.price} monedas?`)) return;

    try {
      const res = await transferCoins({
        recipientId: activeConversation?.userId,
        amount: gift.price,
        reason: `Regalo: ${gift.label}`,
        messageId: `gift-${Date.now()}`
      }) as any;

      if (res.data.success) {
        setShowGiftMenu(false);
        // Trigger Animation
        setShowAnimation(gift.icon);
        setTimeout(() => setShowAnimation(null), 3000);

        // Update Wallet Balance
        refreshUser();

        // Reload messages to show the official holographic receipt from backend
        if (activeConversation) {
          const msgRes = await apiService.getMessages(activeConversation.userId) as any;
          if (msgRes.data.success && msgRes.data.data) {
            setMessages(msgRes.data.data.map(transformMessage));
          }
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'No tienes suficientes monedas para enviar este regalo.';
      alert(errorMsg);
    }
  };


  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 1000 * 60) return 'Ahora';
    if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))} min`;
    if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))} h`;
    return date.toLocaleDateString();
  };

  const formatDateSeparator = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d >= today) return 'Hoy';
    if (d >= yesterday) return 'Ayer';

    return d.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleBuyPack = async (pack: any) => {
    if (!confirm(`¿Comprar "${pack.label}" por ${pack.price} monedas?`)) return;

    try {
      const res = await transferCoins({
        recipientId: activeConversation?.userId,
        amount: pack.price,
        reason: `Compra de pack: ${pack.label}`,
        messageId: `pack-${Date.now()}`
      }) as any;

      if (res.data.success) {
        setShowPriceList(false);

        // Update Wallet Balance
        refreshUser();

        // Reload messages to show the official holographic receipt from backend
        if (activeConversation) {
          const msgRes = await apiService.getMessages(activeConversation.userId) as any;
          if (msgRes.data.success && msgRes.data.data) {
            setMessages(msgRes.data.data.map(transformMessage));
          }
        }
        alert('¡Compra realizada con éxito! El anunciante ha sido notificado.');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'No tienes suficientes monedas para comprar este pack.';
      alert(errorMsg);
    }
  };

  const handleCreateAppointment = async () => {
    if (!appointmentForm.date || !appointmentForm.time || !appointmentForm.location) {
      alert('Por favor completa los campos principales de la cita.');
      return;
    }

    const selectedDate = new Date(appointmentForm.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert('No puedes programar citas para fechas pasadas.');
      return;
    }

    try {
      setIsSubmittingAppointment(true);
      const res = await apiService.createAppointment({
        announcerId: activeConversation?.userId,
        adId: selectedAdId || undefined,
        ...appointmentForm
      }) as any;

      if (res.data.success) {
        alert('¡Solicitud de cita enviada! El anunciante ha sido notificado.');
        setShowAppointmentModal(false);
        setAppointmentForm({ date: '', time: '', location: '', details: '' });

        // Send message to chat as well
        handleSendMessage(`📌 SOLICITUD DE CITA: He solicitado una cita para el ${appointmentForm.date} a las ${appointmentForm.time} en ${appointmentForm.location}.`);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al solicitar cita');
    } finally {
      setIsSubmittingAppointment(false);
    }
  };


  // Determine packs for buying (the partner's packs) and selling (my packs)
  const partnerPacks = activeConversation?.priceList || [];
  const myPacks = (currentUser as any).priceList || [];

  return (
    <div className="animate-in fade-in duration-300 h-full">
      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : (
        <>
          {!activeConversation && (
            <div className="mb-6 flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm border-b border-gray-100 lg:bg-transparent lg:border-none lg:p-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    hapticFeedback('light');
                    onBack();
                  }}
                  className="p-2 rounded-xl bg-white lg:bg-gray-100 hover:bg-gray-200 transition-all shadow-sm lg:shadow-none"
                  aria-label={t('nav.back')}
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Mensajes</h1>
                  <p className="text-sm text-gray-500 font-medium">Chat Seguro</p>
                </div>
              </div>
            </div>
          )}
          <div className="w-full h-full">
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6 h-full relative`}>
              {/* Conversations List */}
              <div className={`lg:col-span-1 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col ${activeConversation ? 'hidden lg:flex' : 'flex'}`}>
                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar conversaciones..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.length > 0 ? (
                    <div className="space-y-1 p-2">
                      {filteredConversations.map(conv => (
                        <button
                          key={conv.id}
                          onClick={() => {
                            hapticFeedback('light');
                            setActiveConversation(conv);
                          }}
                          className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${activeConversation?.id === conv.id ? 'bg-blue-50 ring-1 ring-blue-100' : 'hover:bg-gray-50'} ${conv.id === SYSTEM_USER_ID && activeConversation?.id !== conv.id ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={conv.userAvatar}
                                alt={conv.userName}
                                className="w-12 h-12 rounded-xl object-cover"
                              />
                              {conv.online && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                              )}
                              {conv.id === SYSTEM_USER_ID && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center">
                                  <Bell className="w-3 h-3" />
                                </div>
                              )}
                              {conv.premium && conv.id !== SYSTEM_USER_ID && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center">
                                  <Crown className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className={`font-bold truncate ${conv.id === SYSTEM_USER_ID ? 'text-blue-700' : conv.coins && conv.coins > 0 ? 'animate-gold-text brightness-110 drop-shadow-sm' : 'text-gray-900'} flex items-center gap-1.5`}>
                                  {conv.userName}
                                  {conv.verified && (
                                    <CheckCheck className="w-3.5 h-3.5 text-blue-500" fill="currentColor" stroke="white" />
                                  )}
                                  {(conv.coins && conv.coins > 0) && (
                                    <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                  )}
                                </h3>
                                <span className="text-xs text-gray-500">{formatTime(conv.lastMessageTime)}</span>
                              </div>
                              <p className="text-sm text-gray-600 truncate mb-1">{conv.lastMessage}</p>
                              {conv.id !== SYSTEM_USER_ID && (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {conv.unreadCount > 0 && (
                                      <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {conv.unreadCount}
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-400">
                                      {conv.unreadCount > 0 ? 'No leído' : 'Leído'}
                                    </span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No se encontraron conversaciones</p>
                    </div>
                  )}
                </div>

                {/* New Conversation Button */}
                <div className="p-4 border-t border-gray-100">
                  <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Nueva conversación
                  </button>
                </div>
              </div>

              {/* Chat Area */}
              <div className={`lg:col-span-2 bg-gray-50 rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col relative ${!activeConversation ? 'hidden lg:flex' : 'flex'}`}>
                {activeConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between shadow-sm z-30 shrink-0">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            hapticFeedback('light');
                            setActiveConversation(null);
                          }}
                          className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                          aria-label={t('nav.back')}
                        >
                          <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <div className="flex items-center gap-3">
                          <div className="relative group cursor-pointer">
                            <img
                              src={activeConversation.userAvatar}
                              alt={activeConversation.userName}
                              className="w-10 h-10 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-blue-100 transition-all"
                            />
                            {activeConversation.online && (
                              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className={`font-black text-sm md:text-base flex items-center gap-1.5 ${activeConversation.coins && activeConversation.coins > 0
                                ? 'animate-gold-text drop-shadow-[0_0_2px_rgba(217,119,6,0.3)]'
                                : 'text-gray-900'
                                }`}>
                                {activeConversation.userName}
                                {activeConversation.verified && (
                                  <CheckCheck className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" stroke="white" />
                                )}
                                {(activeConversation.coins && activeConversation.coins > 0) && (
                                  <div className="bg-amber-100 p-0.5 rounded-md shadow-inner">
                                    <Crown className="w-3 h-3 text-amber-600" />
                                  </div>
                                )}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${activeConversation.online ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                {activeConversation.online ? 'En línea' : 'Desconectado'}
                              </span>
                              {activeConversation.premium && (
                                <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                                  <Crown className="w-3 h-3" /> Premium
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeConversation.id !== SYSTEM_USER_ID && activeConversation.role === 'announcer' && (
                          <button
                            onClick={() => setShowAppointmentModal(true)}
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-rose-500 text-white rounded-xl text-[10px] font-black hover:bg-rose-600 transition-all shadow-md shadow-rose-200 uppercase tracking-wider"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Concretar Cita
                          </button>
                        )}
                        {activeConversation.id !== SYSTEM_USER_ID && (
                          <button
                            onClick={() => {
                              hapticFeedback('medium');
                              handleDeleteConversation();
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title={t('nav.delete')}
                            aria-label={t('nav.delete')}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                          <Info className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* GIFT ANIMATION OVERLAY */}
                    {showAnimation && (
                      <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
                        <div className="animate-[bounce_1s_infinite] text-9xl drop-shadow-2xl">
                          {showAnimation}
                        </div>
                      </div>
                    )}



                    {/* Messages */}
                    <div
                      ref={chatContainerRef}
                      onScroll={handleScroll}
                      className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 bg-gray-50/50 custom-scrollbar"
                    >
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="w-8 h-8" />
                          </div>
                          <p className="text-sm font-medium">No hay mensajes en esta conversación</p>
                          <p className="text-xs">¡Sé el primero en saludar!</p>
                        </div>
                      ) : (
                        messages.map((msg, index) => {
                          const isOwn = msg.senderId === currentUser.id || msg.senderId === (currentUser as any)._id;
                          const isSystemMessage = msg.isSystem;

                          const prevMsg = messages[index - 1];
                          const showDateSeparator = !prevMsg ||
                            new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();

                          return (
                            <Fragment key={msg.id}>
                              {showDateSeparator && (
                                <div className="flex justify-center my-6">
                                  <span className="px-3 py-1 bg-white/80 backdrop-blur-sm border border-gray-100 text-gray-500 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm">
                                    {formatDateSeparator(msg.timestamp)}
                                  </span>
                                </div>
                              )}
                              <div
                                className={`flex ${isSystemMessage ? 'justify-center w-full my-3' : isOwn ? 'justify-end' : 'justify-start'} mb-1`}
                              >
                                <div className={`${isSystemMessage ? 'w-full max-w-md mx-auto' : 'max-w-[85%] md:max-w-[70%]'} rounded-2xl p-3 px-4 shadow-sm relative text-sm overflow-hidden ${isSystemMessage
                                  ? 'animate-holo border-2 border-white/50 text-indigo-950 shadow-indigo-200/50 mx-4 md:mx-auto'
                                  : isOwn
                                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                  }`}>

                                  {isSystemMessage && (
                                    <>
                                      <div className="holo-glint-overlay" />
                                      {/* Security Pattern Background */}
                                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")` }} />

                                      <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-indigo-200/30 relative z-10 select-none">
                                        <div className="bg-indigo-600 p-1 rounded-md shadow-inner">
                                          <Shield className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 flex items-center gap-1">
                                          <span className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" />
                                          SafeConnect Official Transaction
                                        </span>
                                      </div>
                                    </>
                                  )}

                                  {msg.isLocked && !msg.isUnlocked && !isOwn ? (
                                    <div className="flex flex-col items-center gap-3 p-4 min-w-[220px]">
                                      <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center animate-pulse">
                                        <Lock className="w-7 h-7" />
                                      </div>
                                      <div className="text-center">
                                        <p className="font-black text-gray-900">Contenido Exclusivo</p>
                                        <p className="text-[10px] text-gray-500">Desbloquea para ver el contenido</p>
                                      </div>
                                      <button
                                        onClick={() => handleUnlock(msg.id, msg.price || 100)}
                                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-lg shadow-amber-200 transition-all w-full flex items-center justify-center gap-2 active:scale-95"
                                      >
                                        <Unlock className="w-4 h-4" />
                                        {msg.price || 100} Coins
                                      </button>
                                    </div>
                                  ) : (
                                    <p className={`leading-relaxed break-words relative z-10 ${isSystemMessage ? 'font-black italic' : ''}`}>
                                      {msg.content}
                                    </p>
                                  )}

                                  <div className={`flex items-center justify-end gap-1 mt-1.5 relative z-10 ${isOwn ? 'text-blue-100' : isSystemMessage ? 'text-indigo-700/60' : 'text-gray-400'}`}>
                                    <span className="text-[10px] font-medium">
                                      {formatTime(msg.timestamp)}
                                    </span>
                                    {isOwn && (
                                      <span>
                                        {msg.read ? (
                                          <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
                                        ) : (
                                          <CheckCheck className="w-3.5 h-3.5 text-blue-200/50" />
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Fragment>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 bg-white border-t border-gray-100 shadow-lg">
                      {activeConversation.id === SYSTEM_USER_ID ? (
                        <div className="flex items-center justify-center py-4 bg-blue-50 rounded-2xl border border-dashed border-blue-200">
                          <p className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Canal de Avisos - Solo Lectura
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 md:p-3 text-gray-400 hover:text-blue-600 transition-colors"
                            aria-label={t('nav.emojis')}
                          >
                            <Smile className="w-5 h-5 md:w-6 h-6" />
                          </button>
                          <button
                            className="p-2 md:p-3 text-gray-400 hover:text-blue-600 transition-colors"
                            aria-label={t('nav.attach')}
                          >
                            <Paperclip className="w-5 h-5 md:w-6 h-6" />
                          </button>

                          {/* GIFTS MENU - FOR ANYONE GIFTING TO AN ANNOUNCER */}
                          {activeConversation.role === 'announcer' && activeConversation.id !== SYSTEM_USER_ID && (
                            <div className="relative">
                              <button
                                className={`p-2 md:p-3 rounded-xl transition-all ${showGiftMenu ? 'bg-amber-500 text-white shadow-lg' : 'text-amber-500 hover:bg-amber-50'}`}
                                onClick={() => {
                                  setShowGiftMenu(!showGiftMenu);
                                  setShowPriceList(false);
                                }}
                              >
                                <Gift className="w-5 h-5 md:w-6 h-6" />
                              </button>

                              {showGiftMenu && (
                                <div className="absolute bottom-full left-0 mb-4 w-[280px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-2 duration-200 z-[100] ring-1 ring-black/5">
                                  <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                      <Gift className="w-3 h-3" /> Enviar Regalo
                                    </span>
                                    <button onClick={() => setShowGiftMenu(false)}><X className="w-4 h-4 text-gray-400" /></button>
                                  </div>
                                  <div className="p-2 grid grid-cols-3 gap-1.5 max-h-[40dvh] overflow-y-auto scrollbar-hide">
                                    {PREDEFINED_GIFTS.map((gift) => (
                                      <button
                                        key={gift.id}
                                        onClick={() => handleSendGift(gift)}
                                        className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all group"
                                      >
                                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{gift.icon}</div>
                                        <div className="text-[9px] font-bold text-gray-700 text-center leading-tight">{gift.label}</div>
                                        <div className="text-[9px] font-black text-amber-600 mt-0.5">{gift.price} 🪙</div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                            </div>
                          )}

                          {/* SERVICES MENU - FOR ANNOUNCER TO SELL OR PARTNER TO BUY */}
                          {(activeConversation.role === 'announcer' || currentUser.role === 'announcer') && activeConversation.id !== SYSTEM_USER_ID && (
                            <div className="relative">
                              <button
                                className={`p-2 md:p-3 rounded-xl transition-all ${showPriceList ? 'bg-rose-500 text-white shadow-lg' : 'text-rose-500 hover:bg-rose-50'}`}
                                onClick={() => {
                                  setShowPriceList(!showPriceList);
                                  setShowGiftMenu(false);
                                }}
                              >
                                {activeConversation.role === 'announcer' ? <Lock className="w-5 h-5 md:w-6 h-6" /> : <Crown className="w-5 h-5 md:w-6 h-6" />}
                              </button>

                              {showPriceList && (
                                <div className="absolute bottom-full left-0 mb-4 w-[280px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-2 duration-200 z-[100] ring-1 ring-black/5">
                                  <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none mb-1">Centro de Contenido</span>
                                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                        {activeConversation.role === 'announcer' ? 'Tienda del Anunciante' : 'Tu Catálogo de Venta'}
                                      </span>
                                    </div>
                                    <button onClick={() => setShowPriceList(false)}><X className="w-4 h-4 text-gray-400" /></button>
                                  </div>

                                  <div className="max-h-[50dvh] overflow-y-auto scrollbar-hide">
                                    {activeConversation.role === 'announcer' ? (
                                      partnerPacks.length > 0 ? (
                                        partnerPacks.map((item: any, idx: number) => (
                                          <button
                                            key={idx}
                                            onClick={() => {
                                              handleBuyPack(item);
                                              setShowPriceList(false);
                                            }}
                                            className="w-full p-4 text-left hover:bg-rose-50 transition-colors border-b border-gray-50 flex items-center justify-between group"
                                          >
                                            <div className="flex-1 pr-2">
                                              <div className="text-[11px] font-black text-gray-900 group-hover:text-rose-600 truncate">{item.label}</div>
                                              <div className="text-[9px] text-gray-500 mt-0.5">Comprar contenido</div>
                                            </div>
                                            <div className="text-rose-600 font-black text-sm group-hover:scale-110 transition-transform shrink-0">
                                              {item.price} 🪙
                                            </div>
                                          </button>
                                        ))
                                      ) : (
                                        <div className="p-8 text-center bg-gray-50/30">
                                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Lock className="w-5 h-5 text-gray-300" />
                                          </div>
                                          <p className="text-[11px] text-gray-500 font-bold leading-relaxed px-4">
                                            Este anunciante aún no ha configurado su contenido para la venta
                                          </p>
                                        </div>
                                      )
                                    ) : (
                                      /* Current user is announcer selling to a normal user */
                                      myPacks.map((item: any, idx: number) => (
                                        <button
                                          key={idx}
                                          onClick={() => {
                                            handleSendMessage(item.label, { isLocked: true, price: item.price });
                                            setShowPriceList(false);
                                          }}
                                          className="w-full p-4 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 flex items-center justify-between group"
                                        >
                                          <div className="flex-1 pr-2">
                                            <div className="text-[11px] font-black text-gray-900 group-hover:text-blue-600 truncate">{item.label}</div>
                                            <div className="text-[9px] text-gray-500 mt-0.5">Enviar oferta de pack</div>
                                          </div>
                                          <div className="text-blue-600 font-black text-sm group-hover:scale-110 transition-transform shrink-0">
                                            {item.price} 🪙
                                          </div>
                                        </button>
                                      ))
                                    )}
                                  </div>
                                  {currentUser.role === 'announcer' && (
                                    <div className="p-3 bg-rose-50">
                                      <button
                                        onClick={() => {
                                          const price = prompt('Precio personalizado:');
                                          const label = prompt('Contenido:');
                                          if (price && label) {
                                            handleSendMessage(label, { isLocked: true, price: parseInt(price) });
                                            setShowPriceList(false);
                                          }
                                        }}
                                        className="w-full py-2.5 bg-white text-rose-600 rounded-xl text-[10px] font-black shadow-sm border border-rose-200 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                                      >
                                        + Nuevo Cobro Directo
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                            </div>
                          )}

                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={e => setNewMessage(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                              placeholder="Escribe algo aquí..."
                              style={{ direction: 'ltr', textAlign: 'left' }}
                              className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 font-medium text-sm md:text-base"
                            />
                          </div>


                          <button
                            onClick={() => {
                              hapticFeedback('medium');
                              handleSendMessage();
                            }}
                            disabled={!newMessage.trim()}
                            className="p-3 md:p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:bg-gray-200 disabled:shadow-none active:scale-95 flex items-center justify-center group"
                            aria-label={t('nav.send')}
                          >
                            <Send className={`w-4 h-4 md:w-5 h-5 ${newMessage.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''} transition-transform`} />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white text-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-8 relative">
                      <MessageCircle className="w-12 h-12 text-blue-600" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">SafeConnect Mensajería</h3>
                    <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                      Selecciona una conversación para empezar a chatear de forma segura y privada.
                      Todos tus mensajes están encriptados.
                    </p>
                    <div className="mt-12 flex items-center gap-6">
                      <div className="flex flex-col items-center gap-1">
                        <Shield className="w-6 h-6 text-green-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seguro</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Lock className="w-6 h-6 text-blue-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Privado</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Modal */}
          {showAppointmentModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative">
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                  <div className="p-4 bg-rose-50 rounded-2xl w-fit mb-6">
                    <Calendar className="w-8 h-8 text-rose-600" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Concretar Cita</h3>
                  <p className="text-gray-500 font-medium text-sm mb-6 leading-relaxed">
                    Completa los detalles para tu encuentro presencial. Una vez enviada, el anunciante podrá confirmarla.
                  </p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Fecha</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={appointmentForm.date}
                            onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Hora</label>
                        <div className="relative">
                          <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="time"
                            value={appointmentForm.time}
                            onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Lugar del encuentro</label>
                      <input
                        type="text"
                        placeholder="Ej: Centro Comercial, Hotel..."
                        value={appointmentForm.location}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, location: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Detalles adicionales (opcional)</label>
                      <textarea
                        placeholder="Alguna nota o instrucción especial..."
                        value={appointmentForm.details}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, details: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold text-sm resize-none"
                      />
                    </div>

                    <button
                      onClick={handleCreateAppointment}
                      disabled={isSubmittingAppointment}
                      className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all active:scale-[0.98] disabled:bg-gray-200 disabled:shadow-none uppercase tracking-widest text-xs"
                    >
                      {isSubmittingAppointment ? 'Enviando...' : 'Confirmar Solicitud'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}