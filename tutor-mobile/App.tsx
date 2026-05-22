import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface Tutor {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
}

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  photo_url?: string | null;
}

interface Appointment {
  id: number;
  pet_name: string;
  species: string;
  vet_name: string | null;
  appointment_date: string;
  reason: string | null;
  room: string | null;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'inicio' | 'agenda' | 'perfil'>('inicio');
  const [loading, setLoading] = useState(false);

  // Estados com dados reais vindos da API (ou fallback mockados)
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Credenciais fake para fallback offline
  const FAKE_CPF = '123.456.789-00';
  const FAKE_PASSWORD = '123456';

  const handleLogin = async () => {
    const cleanCpf = cpf.trim();
    const cleanPass = password.trim();

    if (!cleanCpf || !cleanPass) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      // Tentativa de bater na API de Produção/Homologação VetPro
      const response = await fetch('https://dev-gestorvetpro.it2a.com/api/tutor/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf: cleanCpf,
          password: cleanPass
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Sucesso na autenticação real do banco de dados!
        setTutor(data.tutor);
        setPets(data.pets);
        setAppointments(data.appointments);
        setIsLoggedIn(true);
        setLoading(false);
        return;
      }
      
      // Se a resposta retornou erro mas o CPF digitado for o fake, fazemos o fallback automático
      if (cleanCpf === FAKE_CPF && cleanPass === FAKE_PASSWORD) {
        loadMockData();
        setIsLoggedIn(true);
        setLoading(false);
        return;
      }

      Alert.alert('Erro de Autenticação', data.error || 'Não foi possível fazer o login.');
    } catch (error) {
      console.log('API offline ou erro de rede. Tentando login mockado local...', error);
      
      // Fallback offline se o servidor de desenvolvimento estiver inacessível
      if (cleanCpf === FAKE_CPF && cleanPass === FAKE_PASSWORD) {
        loadMockData();
        setIsLoggedIn(true);
      } else {
        Alert.alert(
          'Erro de Conexão',
          'Não foi possível conectar ao servidor e as credenciais digitadas não correspondem ao perfil de teste local.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setTutor({
      id: 999,
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 98888-7777',
      cpf: FAKE_CPF
    });

    setPets([
      { id: 1, name: 'Luna', species: 'Gato', breed: 'Siamês' },
      { id: 2, name: 'Thor', species: 'Cão', breed: 'Golden Retriever' }
    ]);

    setAppointments([
      {
        id: 101,
        pet_name: 'Luna',
        species: 'Gato',
        vet_name: 'Dr. Ricardo Silva',
        appointment_date: new Date().toISOString(), // Hoje
        reason: 'Consulta de Rotina',
        room: 'Sala 1'
      },
      {
        id: 102,
        pet_name: 'Thor',
        species: 'Cão',
        vet_name: 'Dra. Ana Costa',
        appointment_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // +5 dias
        reason: 'Vacinação Anual',
        room: 'Sala de Vacinas'
      }
    ]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCpf('');
    setPassword('');
    setTutor(null);
    setPets([]);
    setAppointments([]);
    setActiveTab('inicio');
  };

  // Pega as iniciais do nome do Tutor
  const getInitials = (name: string) => {
    if (!name) return 'US';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Formata data do banco de dados (ISO) para formato local
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getPetEmoji = (species: string) => {
    const s = species.toLowerCase();
    if (s.includes('gato') || s.includes('cat') || s.includes('felino')) return '🐱';
    return '🐶';
  };

  // Próxima visita ativa no dashboard
  const nextVisit = appointments.length > 0 ? appointments[0] : null;

  if (!isLoggedIn) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.loginContainer}
      >
        <StatusBar style="light" />
        <View style={styles.loginCard}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <MaterialCommunityIcons name="paw" size={40} color="#fff" />
            </View>
            <Text style={styles.logoText}>VetGrid</Text>
            <Text style={styles.logoSubtitle}>PORTAL DO TUTOR</Text>
          </View>

          <Text style={styles.loginTitle}>Acesse sua Conta</Text>
          <Text style={styles.loginDesc}>Use as credenciais geradas pela clínica no seu cadastro.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CPF (Login)</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="123.456.789-00"
                placeholderTextColor="#94A3B8"
                value={cpf}
                onChangeText={setCpf}
                keyboardType="numeric"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Senha do App</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="******"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.loginBtn, loading && { backgroundColor: '#93C5FD' }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Entrar no App</Text>
            )}
          </TouchableOpacity>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>DICA DE TESTE LOCAL:</Text>
            <Text style={styles.demoText}>CPF: <Text style={styles.demoBold}>{FAKE_CPF}</Text></Text>
            <Text style={styles.demoText}>Senha: <Text style={styles.demoBold}>{FAKE_PASSWORD}</Text></Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {activeTab === 'inicio' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(tutor?.name || '')}</Text>
                </View>
                <View>
                  <Text style={styles.welcomeText}>Bem-vindo,</Text>
                  <Text style={styles.nameText}>{tutor?.name || 'Tutor'}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.notificationBtn}>
                <Ionicons name="notifications" size={20} color="#fff" />
                {appointments.length > 0 && <View style={styles.notificationBadge} />}
              </TouchableOpacity>
            </View>

            {/* Próxima Visita Card dinâmico */}
            {nextVisit ? (
              <View style={styles.nextVisitCard}>
                <View style={styles.nextVisitHeader}>
                  <Text style={styles.nextVisitTitle}>PRÓXIMA VISITA</Text>
                  <Text style={styles.nextVisitTime}>{formatDateTime(nextVisit.appointment_date)}</Text>
                </View>
                <View style={styles.nextVisitBody}>
                  <View style={styles.petAvatarSmall}>
                    <Text style={styles.petAvatarEmoji}>{getPetEmoji(nextVisit.species)}</Text>
                  </View>
                  <View style={styles.visitDetails}>
                    <Text style={styles.visitReason}>{nextVisit.reason || 'Consulta'} - {nextVisit.pet_name}</Text>
                    <Text style={styles.vetName}>{nextVisit.vet_name || 'Médico Veterinário'}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.nextVisitCard}>
                <View style={styles.nextVisitHeader}>
                  <Text style={styles.nextVisitTitle}>PRÓXIMA VISITA</Text>
                </View>
                <View style={styles.nextVisitBody}>
                  <View style={styles.petAvatarSmall}>
                    <Text style={styles.petAvatarEmoji}>📅</Text>
                  </View>
                  <View style={styles.visitDetails}>
                    <Text style={styles.visitReason}>Sem agendamentos ativos</Text>
                    <Text style={styles.vetName}>Clique em agendar para marcar.</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <ActionBtn icon="calendar" label="Agendar" color="#10B981" />
            <ActionBtn icon="medical-bag" label="Exames" color="#8B5CF6" />
            <ActionBtn icon="needle" label="Vacinas" color="#F59E0B" />
            <ActionBtn icon="store" label="Loja" color="#F43F5E" />
          </View>

          {/* Meus Pets Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meus Pets</Text>
            {pets.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petsScroll}>
                {pets.map((pet) => (
                  <PetCard 
                    key={pet.id} 
                    name={pet.name} 
                    breed={pet.breed || 'SRD'} 
                    emoji={getPetEmoji(pet.species)} 
                  />
                ))}
                <View style={{ width: 20 }} />
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>Nenhum pet cadastrado.</Text>
            )}
          </View>

          {/* Dicas de Saúde Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dicas de Saúde</Text>
            <View style={styles.tipCard}>
              <View style={styles.tipContent}>
                <Text style={styles.tipBadge}>VERÃO</Text>
                <Text style={styles.tipTitle}>Cuidados com o Calor</Text>
                <Text style={styles.tipDesc}>Mantenha seu pet hidratado e evite passeios entre 10h e 16h.</Text>
              </View>
              <MaterialCommunityIcons name="white-balance-sunny" size={80} color="rgba(255,255,255,0.1)" style={styles.tipIcon} />
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {activeTab === 'agenda' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.subHeader}>
            <Text style={styles.subHeaderTitle}>Minha Agenda</Text>
          </View>
          
          <View style={styles.paddedSection}>
            <Text style={styles.sectionSubtitle}>Agendamentos Clínicos</Text>
            
            {appointments.length > 0 ? (
              appointments.map((appointment, idx) => (
                <View key={appointment.id} style={styles.agendaItem}>
                  <View style={[styles.agendaStatusLine, { backgroundColor: idx === 0 ? '#10B981' : '#F59E0B' }]} />
                  <View style={styles.agendaContent}>
                    <Text style={styles.agendaDate}>{formatDateTime(appointment.appointment_date)}</Text>
                    <Text style={styles.agendaTitle}>{appointment.reason || 'Consulta'} - {appointment.pet_name} ({getPetEmoji(appointment.species)})</Text>
                    <Text style={styles.agendaSub}>Vet: {appointment.vet_name || 'Profissional'} - {appointment.room || 'Sala 1'}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Sem consultas ou exames agendados.</Text>
            )}
          </View>
        </ScrollView>
      )}

      {activeTab === 'perfil' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.subHeader}>
            <Text style={styles.subHeaderTitle}>Meu Perfil</Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{getInitials(tutor?.name || '')}</Text>
            </View>
            <Text style={styles.profileName}>{tutor?.name || 'Tutor'}</Text>
            <Text style={styles.profileEmail}>{tutor?.email || 'Nenhum e-mail cadastrado'}</Text>
            <Text style={styles.profileCpf}>CPF: {tutor?.cpf || 'Não informado'}</Text>
          </View>

          <View style={styles.paddedSection}>
            <TouchableOpacity style={styles.profileItem}>
              <MaterialCommunityIcons name="account-cog-outline" size={24} color="#475569" />
              <Text style={styles.profileItemText}>Dados Cadastrais</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileItem}>
              <MaterialCommunityIcons name="credit-card-outline" size={24} color="#475569" />
              <Text style={styles.profileItemText}>Planos e Faturamento</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.profileItem, styles.logoutItem]} onPress={handleLogout}>
              <MaterialCommunityIcons name="logout" size={24} color="#EF4444" />
              <Text style={[styles.profileItemText, { color: '#EF4444' }]}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <NavItem icon="home" label="Início" active={activeTab === 'inicio'} onPress={() => setActiveTab('inicio')} />
        <NavItem icon="calendar-blank" label="Agenda" active={activeTab === 'agenda'} onPress={() => setActiveTab('agenda')} />
        <NavItem icon="account" label="Perfil" active={activeTab === 'perfil'} onPress={() => setActiveTab('perfil')} />
      </View>
    </SafeAreaView>
  );
}

// Helper Components
const ActionBtn = ({ icon, label, color }: { icon: any, label: string, color: string }) => (
  <TouchableOpacity style={styles.actionBtnContainer}>
    <View style={[styles.actionBtn, { backgroundColor: color }]}>
      <MaterialCommunityIcons name={icon} size={28} color="#fff" />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const PetCard = ({ name, breed, emoji }: { name: string, breed: string, emoji: string }) => (
  <TouchableOpacity style={styles.petCard}>
    <View style={styles.petAvatar}>
      <Text style={styles.petAvatarEmojiBig}>{emoji}</Text>
    </View>
    <Text style={styles.petName}>{name}</Text>
    <Text style={styles.petBreed}>{breed}</Text>
  </TouchableOpacity>
);

const NavItem = ({ icon, label, active = false, onPress }: { icon: any, label: string, active?: boolean, onPress: () => void }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={26} color={active ? '#2563EB' : '#94A3B8'} />
    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F9',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#1E40AF',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  nameText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#1E40AF',
  },
  nextVisitCard: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  nextVisitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nextVisitTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  nextVisitTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  nextVisitBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petAvatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  petAvatarEmoji: {
    fontSize: 24,
  },
  visitDetails: {
    flex: 1,
  },
  visitReason: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  vetName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: -28,
    marginBottom: 32,
  },
  actionBtnContainer: {
    alignItems: 'center',
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 8,
  },
  actionLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  petsScroll: {
    paddingLeft: 24,
  },
  petCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginRight: 16,
    width: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  petAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  petAvatarEmojiBig: {
    fontSize: 32,
  },
  petName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 12,
    color: '#64748B',
  },
  tipCard: {
    marginHorizontal: 24,
    backgroundColor: '#8B5CF6',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  tipContent: {
    flex: 1,
    zIndex: 1,
  },
  tipBadge: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  tipTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  tipDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 20,
  },
  tipIcon: {
    position: 'absolute',
    right: -10,
    bottom: -20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#2563EB',
  },
  
  // Login Styles
  loginContainer: {
    flex: 1,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loginCard: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 400,
    borderRadius: 28,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  logoSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 2,
    marginTop: 4,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  loginDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#1E293B',
    fontSize: 15,
  },
  loginBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  demoBox: {
    marginTop: 24,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '850',
    color: '#1E40AF',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  demoText: {
    fontSize: 13,
    color: '#1E40AF',
    marginBottom: 2,
  },
  demoBold: {
    fontWeight: '700',
  },

  // Subheader for Tabs
  subHeader: {
    backgroundColor: '#1E40AF',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
  },
  subHeaderTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  paddedSection: {
    paddingHorizontal: 24,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  agendaItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
    overflow: 'hidden',
  },
  agendaStatusLine: {
    width: 6,
  },
  agendaContent: {
    padding: 16,
    flex: 1,
  },
  agendaDate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  agendaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  agendaSub: {
    fontSize: 13,
    color: '#64748B',
  },

  // Profile Styles
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563EB',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  profileCpf: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  profileItemText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  logoutItem: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FFF5F5',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 24
  }
});
