
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Users, 
  Star, 
  Bed, 
  Bath, 
  Square, 
  ArrowRight,
  Shield,
  Clock,
  Award,
  Phone,
  Mail,
  Calendar,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Waves,
  Trees,
  Home
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { CustomerNavbar } from '@/components/customer/navbar';
import { CustomerFooter } from '@/components/customer/footer';

const mockProperties = [
  {
    id: '1',
    name: 'Sunset Apartments',
    location: 'San Francisco, CA',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    rent: 2750,
    image: '/property-1.jpg',
    amenities: ['Gym', 'Rooftop Deck', 'Parking', 'Concierge'],
    available: true,
    rating: 4.5,
    description: 'Modern luxury apartment with city views'
  },
  {
    id: '2',
    name: 'Garden View Complex',
    location: 'San Jose, CA',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1400,
    rent: 2900,
    image: '/property-2.jpg',
    amenities: ['Pool', 'Playground', 'BBQ Area', 'Pet Park'],
    available: true,
    rating: 4.2,
    description: 'Family-friendly complex with garden views'
  },
  {
    id: '3',
    name: 'Downtown Plaza',
    location: 'Los Angeles, CA',
    type: 'Condo',
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 900,
    rent: 3200,
    image: '/property-3.jpg',
    amenities: ['Concierge', 'Spa', 'Business Center', 'Valet'],
    available: true,
    rating: 4.8,
    description: 'Luxury high-rise in downtown LA'
  }
];

export default function CustomerHomePage() {
  const { t } = useI18n();
  const [selectedProperty, setSelectedProperty] = useState(null);

  const stats = [
    { label: t('hero.stats.properties'), value: '50+', icon: Building2 },
    { label: t('hero.stats.tenants'), value: '2,500+', icon: Users },
    { label: t('hero.stats.locations'), value: '15+', icon: MapPin },
    { label: t('hero.stats.years'), value: '25+', icon: Award },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'All properties feature 24/7 security and modern safety systems'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock maintenance and tenant support services'
    },
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Luxury amenities and high-quality finishes in all units'
    }
  ];

  return (
    <div className="min-h-screen">
      <CustomerNavbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/customer/properties">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/customer/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Phone className="mr-2 h-5 w-5" />
                {t('nav.contact')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('properties.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('properties.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Property Image */}
                <div className="relative h-64 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="text-center">
                    <Home className="h-16 w-16 text-blue-600 mx-auto mb-2" />
                    <p className="text-blue-800 font-medium">{property.name}</p>
                  </div>
                  {property.available && (
                    <Badge className="absolute top-4 right-4 bg-green-500">
                      {t('properties.details.available')}
                    </Badge>
                  )}
                  <div className="absolute top-4 left-4 flex items-center space-x-1 bg-white/90 rounded-full px-2 py-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{property.rating}</span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold">{property.name}</h3>
                    <Badge variant="outline">{property.type}</Badge>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{property.description}</p>
                  
                  {/* Property Details */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>{property.bedrooms} {t('properties.details.bedrooms')}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span>{property.bathrooms} {t('properties.details.bathrooms')}</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span>{property.squareFeet} {t('properties.details.sqft')}</span>
                    </div>
                  </div>
                  
                  {/* Amenities */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {property.amenities.slice(0, 3).map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {property.amenities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{property.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">{t('properties.details.starting')}</span>
                      <div className="text-2xl font-bold text-green-600">
                        ${property.rent.toLocaleString()}<span className="text-sm text-gray-500">{t('properties.details.month')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Link href={`/customer/properties/${property.id}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          {t('properties.details.viewDetails')}
                        </Button>
                      </Link>
                      <Link href="/customer/apply">
                        <Button size="sm" className="w-full">
                          {t('properties.details.applyNow')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/customer/properties">
              <Button size="lg">
                View All Properties
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PropertyHub?
            </h2>
            <p className="text-xl text-gray-600">
              Experience premium property management with world-class service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your New Home?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Browse our available properties and submit your application online today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/customer/properties">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Browse Properties
              </Button>
            </Link>
            <Link href="/customer/apply">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Calendar className="mr-2 h-5 w-5" />
                Apply Online
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}

