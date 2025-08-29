import { View, Text, StyleSheet, ScrollView, Image, Linking, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

export default function AboutScreen() {
    const APP_VERSION = Constants.manifest.version;
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerBox}>
                <Image
                    source={require('../../assets/images/icon.png')}
                    style={styles.icon}
                    resizeMode="contain"
                />
                <Text style={styles.title}>AI Errand Commander</Text>
                <Text style={styles.version}>Version {APP_VERSION}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>About the App</Text>
                <Text style={styles.text}>
                    <Text style={styles.bold}>AI Errand Commander</Text> is a Foursquare API and gpt-oss-20b powered smart assistant for planning and optimizing daily errands.
                    Enter your tasks and let the app find the best places and route for you, powered by AI and Foursquare.
                </Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>About the Developer</Text>
                <Text style={styles.text}>
                    Hi, I'm <TouchableOpacity
                        onPress={() => Linking.openURL('https://www.linkedin.com/in/nabil-ansari-9aa91120b/')}
                        activeOpacity={0.7}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    ><FontAwesome name='linkedin' size={15} />
                        <Text style={styles.bold}>Nabil Aman Ansari</Text></TouchableOpacity>, a passionate developer focused on building helpful and intelligent applications.
                    This project was created for the Foursquare Hackathon 2025 to help people save time and effort in their daily routines.
                </Text>
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
                    onPress={() => Linking.openURL('mailto:nabil.aaaman@gmail.com')}
                    activeOpacity={0.7}
                >
                    <FontAwesome name='envelope' size={20} style={{ marginRight: 8, marginTop: 10, color: '#374151' }} />
                    <Text style={styles.email}>
                        nabil.aaaman@gmail.com
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
                    onPress={() => Linking.openURL('mailto:nabil.aaaman@gmail.com')}
                    activeOpacity={0.7}
                >
                    <FontAwesome name='github' size={20} style={{ marginRight: 8, marginTop: 10, color: '#374151' }} />
                    <Text style={styles.email}>
                        nabil.aaaman@gmail.com
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 0,
        backgroundColor: '#F1F5F9',
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    headerBox: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#3B82F6',
        paddingTop: 40,
        paddingBottom: 32,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        marginBottom: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    icon: {
        width: 90,
        height: 90,
        marginBottom: 12,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
        letterSpacing: 1,
    },
    version: {
        fontSize: 15,
        color: '#DBEAFE',
        marginBottom: 0,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 24,
        marginBottom: 18,
        width: '88%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E40AF',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    text: {
        fontSize: 16,
        color: '#374151',
        marginBottom: 10,
        lineHeight: 22,
    },
    bold: {
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    email: {
        fontSize: 16,
        color: '#2563EB',
        textDecorationLine: 'underline',
        marginTop: 10,
        fontWeight: '600',
    },
});