import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Clock, Send, CheckCircle2, Instagram, Facebook, ArrowLeft } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ContactPage: React.FC = () => {
  const { config, setCurrentView, showToast } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      showToast('Veuillez remplir tous les champs', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Votre message a bien été envoyé !', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Back to Home Button */}
      <div className="mb-6">
        <button
          onClick={() => setCurrentView('home')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-50 text-xs font-bold shadow-xs transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-store-primary" />
          <span>← Retour à la boutique</span>
        </button>
      </div>

      <div className="text-center max-w-lg mx-auto mb-10">
        <div className="w-12 h-12 rounded-2xl bg-store-secondary text-store-primary flex items-center justify-center mx-auto mb-3 shadow-xs">
          <MessageCircle className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Contactez Notre Équipe
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-stone-500">
          Une question sur une taille, une disponibilité ou votre livraison ? Nous vous répondons avec plaisir 7 jours sur 7.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Info Card */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-store-border p-6 shadow-card space-y-5">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Coordonnées
            </h3>

            {/* WhatsApp Direct */}
            <a
              href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Bonjour, je souhaite des renseignements.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center gap-3 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold">WhatsApp Direct</p>
                <p className="text-[11px] text-emerald-700">Réponse rapide en moins de 15 min</p>
              </div>
            </a>

            {/* Phone */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-store-base border border-store-border">
              <div className="w-10 h-10 rounded-xl bg-store-secondary text-store-primary flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">Téléphone Service Client</p>
                <p className="text-[11px] text-stone-600">{config.phone}</p>
              </div>
            </div>

            {/* Store Hours */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-store-base border border-store-border">
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">Horaires d'ouverture</p>
                <p className="text-[11px] text-stone-600">Samedi au Jeudi : 09h00 - 21h00</p>
              </div>
            </div>

            {/* Socials */}
            <div className="pt-2 border-t border-stone-100">
              <p className="text-xs font-semibold text-stone-700 mb-2">Suivez nos nouveautés :</p>
              <div className="flex gap-2">
                {config.instagramUrl && (
                  <a
                    href={config.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-store-secondary text-stone-700 hover:text-store-primary transition-colors flex items-center gap-1.5 text-xs font-medium"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Instagram</span>
                  </a>
                )}
                {config.facebookUrl && (
                  <a
                    href={config.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-store-secondary text-stone-700 hover:text-store-primary transition-colors flex items-center gap-1.5 text-xs font-medium"
                  >
                    <Facebook className="w-4 h-4" />
                    <span>Facebook</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-7">
          <div className="bg-white rounded-3xl border border-store-border p-6 sm:p-8 shadow-card">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-1">
                  Message bien reçu !
                </h3>
                <p className="text-xs text-stone-600 mb-4">
                  Merci {name}, notre conseillère va vous recontacter très rapidement.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                  Laissez-nous un message
                </h3>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Votre Nom complet
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Sarah Ben"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Votre Numéro de Téléphone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="05 / 06 / 07 XX XX XX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Votre Message ou Question
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Comment pouvons-nous vous aider ?"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-store-primary hover:bg-store-primary-hover text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-soft flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Envoyer mon message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

