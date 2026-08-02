async function testLogin() {
  const url = 'https://ztclcougopgsndkttxrw.supabase.co/auth/v1/token?grant_type=password';
  const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y2xjb3Vnb3Bnc25ka3R0eHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjc3NDYsImV4cCI6MjEwMDgwMzc0Nn0.9kYfkph7XDCKo1-VQ5j-ICSxaneFEh235mvZOE86DlE';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        email: 'admin@autocraft.com',
        password: 'admin123'
      })
    });

    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text}`);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testLogin();
