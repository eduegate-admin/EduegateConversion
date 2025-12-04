import React, {Component, ReactNode, ErrorInfo} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Button, Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const {hasError, error, errorInfo} = this.state;
    const {children, fallback} = this.props;

    if (hasError) {
      // If custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.iconContainer}>
              <Icon name="alert-circle" size={80} color="#f44336" />
            </View>

            <Text variant="headlineMedium" style={styles.title}>
              Oops! Something went wrong
            </Text>

            <Text variant="bodyMedium" style={styles.subtitle}>
              We're sorry for the inconvenience. The app encountered an unexpected
              error.
            </Text>

            <Card style={styles.errorCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.errorTitle}>
                  Error Details:
                </Text>
                <Text variant="bodySmall" style={styles.errorMessage}>
                  {error?.toString()}
                </Text>

                {__DEV__ && errorInfo && (
                  <>
                    <Text variant="titleSmall" style={[styles.errorTitle, {marginTop: 15}]}>
                      Stack Trace:
                    </Text>
                    <Text variant="bodySmall" style={styles.stackTrace}>
                      {errorInfo.componentStack}
                    </Text>
                  </>
                )}
              </Card.Content>
            </Card>

            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={this.handleReset}
                icon="refresh"
                style={styles.button}
                contentStyle={styles.buttonContent}>
                Try Again
              </Button>

              <Button
                mode="outlined"
                onPress={() => {
                  // In real app, this could navigate to support or report the error
                  console.log('Report error');
                }}
                icon="bug"
                style={styles.button}
                contentStyle={styles.buttonContent}>
                Report Issue
              </Button>
            </View>

            <Text variant="bodySmall" style={styles.helpText}>
              If the problem persists, please contact support or restart the app.
            </Text>
          </ScrollView>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  errorCard: {
    marginBottom: 30,
    backgroundColor: '#fff',
    elevation: 2,
  },
  errorTitle: {
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 8,
  },
  errorMessage: {
    color: '#666',
    fontFamily: 'monospace',
  },
  stackTrace: {
    color: '#999',
    fontFamily: 'monospace',
    fontSize: 10,
  },
  actions: {
    gap: 12,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  helpText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});

export default ErrorBoundary;
