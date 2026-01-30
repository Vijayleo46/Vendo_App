import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Database, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { testBackendConnection } from '../../utils/testBackendConnection';

interface BackendStatusProps {
  onStatusChange?: (connected: boolean) => void;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({ onStatusChange }) => {
  const { theme } = useTheme();
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const result = await testBackendConnection();
      if (result.success) {
        setStatus('connected');
        setDetails(result);
        onStatusChange?.(true);
      } else {
        setStatus('error');
        setDetails(result);
        onStatusChange?.(false);
      }
    } catch (error) {
      setStatus('error');
      setDetails({ error: error instanceof Error ? error.message : String(error) });
      onStatusChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    if (loading) return <RefreshCw size={16} color="#6B7280" />;

    switch (status) {
      case 'connected':
        return <CheckCircle size={16} color="#10B981" />;
      case 'error':
        return <XCircle size={16} color="#EF4444" />;
      default:
        return <AlertCircle size={16} color="#F59E0B" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#10B981';
      case 'error': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const getStatusText = () => {
    if (loading) return 'Checking...';

    switch (status) {
      case 'connected':
        return `Connected (${details?.listingsCount || 0} items)`;
      case 'error':
        return 'Connection Failed';
      default:
        return 'Checking Connection';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: getStatusColor() }]}
      onPress={checkConnection}
      disabled={loading}
    >
      <Database size={20} color={getStatusColor()} />
      <View style={styles.statusInfo}>
        <View style={styles.statusRow}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: theme.text }]}>
            {getStatusText()}
          </Text>
        </View>
        {details && status === 'connected' && (
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            {details.userLoggedIn ? `User: ${details.userEmail}` : 'No user logged in'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginVertical: 8,
  },
  statusInfo: {
    marginLeft: 12,
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 12,
    marginTop: 2,
  },
});