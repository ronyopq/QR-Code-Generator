import type { QRConfig } from '../types'
import { defaultConfig } from '../types'

export interface Template {
  id: string
  name: string
  desc: string
  emoji: string
  gradient: string
  apply: (c: QRConfig) => QRConfig
}

const base = () => defaultConfig()

export const TEMPLATES: Template[] = [
  { id:'business', name:'Business Card', desc:'Professional navy + gold vCard', emoji:'💼', gradient:'from-slate-900 to-indigo-600',
    apply:(c)=>({...base(), type:'vcard', name:'Business Card QR', fields:{name:'Jane Doe',phone:'+8801712345678',email:'jane@company.com',org:'Acme Inc',title:'Founder',website:'https://example.com',address:'Dhaka'}, bodyStyle:'rounded', eyeStyle:'extra-rounded', colorMode:'single', fgColor:'#0f172a', bgMode:'solid', bgColor:'#ffffff'}) },
  { id:'menu', name:'Restaurant Menu', desc:'Warm gradient menu QR', emoji:'🍽️', gradient:'from-orange-500 to-rose-500',
    apply:(c)=>({...base(), type:'menu', name:'Restaurant Menu', fields:{url:'https://example.com/menu',name:'Spice House'}, bodyStyle:'extra-rounded', eyeStyle:'extra-rounded', colorMode:'gradient', gradientFrom:'#f97316', gradientTo:'#e11d48', bgMode:'solid', bgColor:'#fff7ed'}) },
  { id:'product', name:'Product Label', desc:'Bold dots for packaging', emoji:'🏷️', gradient:'from-emerald-500 to-teal-600',
    apply:(c)=>({...base(), type:'url', name:'Product QR', fields:{url:'https://example.com/product'}, bodyStyle:'dots', eyeStyle:'dot', colorMode:'single', fgColor:'#065f46', bgMode:'solid', bgColor:'#ecfdf5'}) },
  { id:'event', name:'Event Ticket', desc:'Vivid event QR with calendar', emoji:'🎟️', gradient:'from-violet-600 to-fuchsia-500',
    apply:(c)=>({...base(), type:'event', name:'Event Ticket', fields:{title:'Summer Fest 2026',start:'2026-08-15T18:00',end:'2026-08-15T23:00',location:'Dhaka',description:'Live music & food'}, bodyStyle:'classy-rounded', eyeStyle:'extra-rounded', colorMode:'gradient', gradientFrom:'#7c3aed', gradientTo:'#d946ef', bgMode:'solid', bgColor:'#faf5ff'}) },
  { id:'social', name:'Social Profile', desc:'Gradient social hub', emoji:'📱', gradient:'from-pink-500 to-violet-600',
    apply:(c)=>({...base(), type:'social', name:'Social Profile', fields:{url:'https://linktr.ee/example'}, bodyStyle:'rounded', eyeStyle:'extra-rounded', colorMode:'multi', gradientFrom:'#ec4899', gradientMid:'#8b5cf6', gradientTo:'#6366f1', bgMode:'transparent'}) },
  { id:'website', name:'Website Promotion', desc:'Clean classic website QR', emoji:'🌐', gradient:'from-sky-500 to-blue-700',
    apply:(c)=>({...base(), type:'url', name:'Website Promo', fields:{url:'https://example.com'}, bodyStyle:'square', eyeStyle:'square', colorMode:'single', fgColor:'#1e3a8a', bgMode:'solid', bgColor:'#eff6ff'}) },
  { id:'wifi', name:'WiFi Sharing', desc:'Guest WiFi auto-connect', emoji:'📶', gradient:'from-cyan-500 to-emerald-500',
    apply:(c)=>({...base(), type:'wifi', name:'Guest WiFi', fields:{ssid:'GuestWiFi',password:'welcome123',encryption:'WPA',hidden:'false'}, bodyStyle:'rounded', eyeStyle:'dot', colorMode:'gradient', gradientFrom:'#06b6d4', gradientTo:'#10b981', bgMode:'solid', bgColor:'#f0fdfa'}) },
]
