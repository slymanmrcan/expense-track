'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// Basit matematik captcha üret
function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 10) + 1 // 1-10
  const num2 = Math.floor(Math.random() * 10) + 1 // 1-10
  const operators = ['+', '-', '×'] as const
  const operator = operators[Math.floor(Math.random() * operators.length)]
  
  let answer: number
  switch (operator) {
    case '+':
      answer = num1 + num2
      break
    case '-':
      answer = Math.max(num1, num2) - Math.min(num1, num2) // Negatif olmasın
      break
    case '×':
      answer = num1 * num2
      break
  }
  
  const question = operator === '-' 
    ? `${Math.max(num1, num2)} ${operator} ${Math.min(num1, num2)}`
    : `${num1} ${operator} ${num2}`
  
  return { question, answer }
}

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [captcha, setCaptcha] = useState({ question: '', answer: 0 })
  
  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    verificationCode: '',
    captchaAnswer: '',
  })

  // Captcha'yı yenile
  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha())
    setForm(f => ({ ...f, captchaAnswer: '' }))
  }, [])

  // Sayfa yüklendiğinde ve mod değiştiğinde captcha üret
  useEffect(() => {
    refreshCaptcha()
  }, [isLogin, refreshCaptcha])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Captcha kontrolü
    if (parseInt(form.captchaAnswer) !== captcha.answer) {
      setError('Matematik sorusu yanlış')
      refreshCaptcha()
      setLoading(false)
      return
    }

    // Kayıt için doğrulama kodu kontrolü
    if (!isLogin && form.verificationCode !== '314159265') {
      setError('Geçersiz doğrulama kodu')
      setLoading(false)
      return
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin 
        ? { username: form.username, password: form.password }
        : { 
            username: form.username, 
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
          }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Bir hata oluştu')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="card animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
              <span className="text-3xl">💰</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Harcama Takip</h1>
            <p className="text-gray-400 mt-1">
              {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Ad</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Adınız"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required={!isLogin}
                    />
                  </div>
                  <div>
                    <label className="label">Soyad</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Soyadınız"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required={!isLogin}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="ornek@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            <div>
              <label className="label">Kullanıcı Adı</label>
              <input
                type="text"
                className="input"
                placeholder="kullaniciadi"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Şifre</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <span>🤖</span>
                <span>{captcha.question} = ?</span>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="ml-auto text-xs text-blue-400 hover:text-blue-300"
                >
                  Yenile
                </button>
              </label>
              <input
                type="number"
                className="input"
                placeholder="Sonucu girin"
                value={form.captchaAnswer}
                onChange={(e) => setForm({ ...form, captchaAnswer: e.target.value })}
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="label">Doğrulama Kodu</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Davet kodunu girin"
                  value={form.verificationCode}
                  onChange={(e) => setForm({ ...form, verificationCode: e.target.value })}
                  required={!isLogin}
                />
                <p className="text-xs text-gray-500 mt-1">Bot koruması için doğrulama kodu gerekli</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Yükleniyor...
                </span>
              ) : (
                isLogin ? 'Giriş Yap' : 'Kayıt Ol'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              {isLogin ? 'Hesabınız yok mu? ' : 'Zaten hesabınız var mı? '}
              <span className="text-blue-400 hover:text-blue-300 font-medium">
                {isLogin ? 'Kayıt olun' : 'Giriş yapın'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
