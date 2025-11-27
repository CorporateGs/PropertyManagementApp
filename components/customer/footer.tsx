
'use client';

import Link from 'next/link';
import { Building2, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function CustomerFooter() {
  const { t } = useI18n();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold">PropertyHub</span>
            </div>
            <p className="text-gray-400 text-sm">
              Premium property management solutions with luxury apartments and exceptional service in prime locations.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/customer" className="block text-gray-400 hover:text-white text-sm">
                {t('nav.home')}
              </Link>
              <Link href="/customer/properties" className="block text-gray-400 hover:text-white text-sm">
                {t('nav.properties')}
              </Link>
              <Link href="/customer/about" className="block text-gray-400 hover:text-white text-sm">
                {t('nav.about')}
              </Link>
              <Link href="/customer/contact" className="block text-gray-400 hover:text-white text-sm">
                {t('nav.contact')}
              </Link>
              <Link href="/customer/apply" className="block text-gray-400 hover:text-white text-sm">
                {t('nav.apply')}
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <div className="space-y-2">
              <Link href="#" className="block text-gray-400 hover:text-white text-sm">
                Apartment Rentals
              </Link>
              <Link href="#" className="block text-gray-400 hover:text-white text-sm">
                Property Management
              </Link>
              <Link href="#" className="block text-gray-400 hover:text-white text-sm">
                Maintenance Services
              </Link>
              <Link href="#" className="block text-gray-400 hover:text-white text-sm">
                Tenant Support
              </Link>
              <Link href="#" className="block text-gray-400 hover:text-white text-sm">
                Online Applications
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('contact.info.office')}</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-sm text-gray-400">
                  <p>123 Business Boulevard</p>
                  <p>San Francisco, CA 94102</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-400">(555) 123-RENT</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-400">info@propertyhub.com</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-red-900 rounded-lg">
              <p className="text-sm font-medium text-red-100">
                {t('contact.info.emergency')}
              </p>
              <p className="text-sm text-red-200">(555) 911-HELP</p>
              <p className="text-xs text-red-300">Available 24/7</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">
              © 2024 PropertyHub. All rights reserved.
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="#" className="text-sm text-gray-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-white">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-white">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

