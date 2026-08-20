import { Eye, EyeOff } from 'lucide-react'
import { useState, type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; password?: boolean }
export function AuthField({ label, password = false, ...props }: Props) { const [visible, setVisible] = useState(false); return <label className="auth-field"><span>{label}</span><div className="auth-input-wrap"><input {...props} type={password && !visible ? 'password' : 'text'} />{password && <button type="button" className="password-toggle" onClick={() => setVisible(value => !value)} aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}>{visible ? <EyeOff /> : <Eye />}</button>}</div></label> }