const AuthLoader = () => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner} />
      <p style={styles.text}>Checking authentication…</p>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f9fafb',
  },
  spinner: {
    width: 48,
    height: 48,
    border: '5px solid #e5e7eb',
    borderTop: '5px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
};

export default AuthLoader;
