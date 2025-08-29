import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ErrandHistory {
  id: string;
  taskInput: string;
  placesCount: number;
  totalDistance: number;
  date: string;
  completed: boolean;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<ErrandHistory[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('errandHistory');
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const saveHistory = async (newHistory: ErrandHistory[]) => {
    try {
      await AsyncStorage.setItem('errandHistory', JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('errandHistory');
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const filteredHistory = history.filter(item => {
    if (selectedFilter === 'completed') return item.completed;
    if (selectedFilter === 'pending') return !item.completed;
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const toggleComplete = (id: string) => {
    setHistory(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Errand History</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {(['all', 'completed', 'pending'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === filter && styles.filterButtonTextActive
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.historyMeta}>
                  <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                  <View style={[
                    styles.statusBadge,
                    item.completed ? styles.completedBadge : styles.pendingBadge
                  ]}>
                    <Text style={[
                      styles.statusText,
                      item.completed ? styles.completedText : styles.pendingText
                    ]}>
                      {item.completed ? 'Completed' : 'Pending'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => toggleComplete(item.id)}
                >
                  <Ionicons
                    name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                    size={24}
                    color={item.completed ? "#10B981" : "#D1D5DB"}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.historyTask}>{item.taskInput}</Text>

              <View style={styles.historyStats}>
                <View style={styles.statItem}>
                  <Ionicons name="location" size={16} color="#6B7280" />
                  <Text style={styles.statText}>{item.placesCount} places</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="walk" size={16} color="#6B7280" />
                  <Text style={styles.statText}>{item.totalDistance}m total</Text>
                </View>
              </View>

              {/* <View style={styles.historyActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="refresh" size={16} color="#3B82F6" />
                  <Text style={styles.actionButtonText}>Repeat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-outline" size={16} color="#6B7280" />
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
              </View> */}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No errands yet</Text>
            <Text style={styles.emptyStateText}>
              Your completed and planned errands will appear here for easy reference.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  clearButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyMeta: {
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  completedText: {
    color: '#065F46',
  },
  pendingText: {
    color: '#92400E',
  },
  completeButton: {
    marginLeft: 12,
  },
  historyTask: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 22,
  },
  historyStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  historyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});