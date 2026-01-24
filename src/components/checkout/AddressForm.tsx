import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { MapPin, Home, Building } from 'lucide-react';

interface Address {
  id?: string;
  first_name: string;
  last_name: string;
  street: string;
  street2?: string;
  postal_code: string;
  city: string;
  country: string;
  type: 'shipping' | 'billing';
}

interface AddressFormProps {
  type: 'shipping' | 'billing';
  onAddressChange: (address: Address) => void;
  initialAddress?: Address | null;
  useSameAsShipping?: boolean;
  onUseSameAsShippingChange?: (value: boolean) => void;
  shippingAddress?: Address | null;
}

const COUNTRIES = [
  { code: 'DE', name: 'Deutschland' },
  { code: 'AT', name: 'Österreich' },
  { code: 'CH', name: 'Schweiz' },
];

export function AddressForm({
  type,
  onAddressChange,
  initialAddress,
  useSameAsShipping,
  onUseSameAsShippingChange,
  shippingAddress,
}: AddressFormProps) {
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [address, setAddress] = useState<Address>({
    first_name: '',
    last_name: '',
    street: '',
    street2: '',
    postal_code: '',
    city: '',
    country: 'DE',
    type,
  });

  // Load saved addresses for logged-in users
  useEffect(() => {
    if (user) {
      loadSavedAddresses();
    }
  }, [user]);

  // Set initial address if provided
  useEffect(() => {
    if (initialAddress) {
      setAddress(initialAddress);
      if (initialAddress.id) {
        setSelectedAddressId(initialAddress.id);
      }
    }
  }, [initialAddress]);

  // Handle "same as shipping" for billing
  useEffect(() => {
    if (type === 'billing' && useSameAsShipping && shippingAddress) {
      const billingAddress = { ...shippingAddress, type: 'billing' as const };
      setAddress(billingAddress);
      onAddressChange(billingAddress);
    }
  }, [useSameAsShipping, shippingAddress, type, onAddressChange]);

  const loadSavedAddresses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', type)
      .order('is_default', { ascending: false });

    if (!error && data) {
      setSavedAddresses(data as Address[]);
      
      // Auto-select default address
      const defaultAddress = data.find((a: any) => a.is_default);
      if (defaultAddress && !initialAddress) {
        setSelectedAddressId(defaultAddress.id);
        const addr = defaultAddress as Address;
        setAddress(addr);
        onAddressChange(addr);
      }
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    
    if (addressId === 'new') {
      const newAddress: Address = {
        first_name: '',
        last_name: '',
        street: '',
        street2: '',
        postal_code: '',
        city: '',
        country: 'DE',
        type,
      };
      setAddress(newAddress);
      onAddressChange(newAddress);
    } else {
      const selected = savedAddresses.find((a) => a.id === addressId);
      if (selected) {
        setAddress(selected);
        onAddressChange(selected);
      }
    }
  };

  const handleInputChange = (field: keyof Address, value: string) => {
    const updated = { ...address, [field]: value };
    setAddress(updated);
    onAddressChange(updated);
  };

  const isFormValid = () => {
    return (
      address.first_name.trim() !== '' &&
      address.last_name.trim() !== '' &&
      address.street.trim() !== '' &&
      address.postal_code.trim() !== '' &&
      address.city.trim() !== '' &&
      address.country !== ''
    );
  };

  const Icon = type === 'shipping' ? MapPin : Building;
  const title = type === 'shipping' ? 'Lieferadresse' : 'Rechnungsadresse';

  // If using same as shipping for billing, show minimal info
  if (type === 'billing' && useSameAsShipping) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="sameAsShipping"
              checked={useSameAsShipping}
              onCheckedChange={(checked) => onUseSameAsShippingChange?.(checked as boolean)}
            />
            <Label htmlFor="sameAsShipping" className="text-sm cursor-pointer">
              Gleiche Adresse wie Lieferadresse
            </Label>
          </div>
          {shippingAddress && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium">{shippingAddress.first_name} {shippingAddress.last_name}</p>
              <p>{shippingAddress.street}</p>
              {shippingAddress.street2 && <p>{shippingAddress.street2}</p>}
              <p>{shippingAddress.postal_code} {shippingAddress.city}</p>
              <p>{COUNTRIES.find(c => c.code === shippingAddress.country)?.name || shippingAddress.country}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Same as shipping checkbox for billing */}
        {type === 'billing' && onUseSameAsShippingChange && (
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Checkbox
              id="sameAsShipping"
              checked={useSameAsShipping}
              onCheckedChange={(checked) => onUseSameAsShippingChange(checked as boolean)}
            />
            <Label htmlFor="sameAsShipping" className="text-sm cursor-pointer">
              Gleiche Adresse wie Lieferadresse
            </Label>
          </div>
        )}

        {/* Saved addresses dropdown for logged-in users */}
        {user && savedAddresses.length > 0 && (
          <div className="space-y-2">
            <Label>Gespeicherte Adressen</Label>
            <Select value={selectedAddressId} onValueChange={handleAddressSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Adresse wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Neue Adresse eingeben
                  </div>
                </SelectItem>
                {savedAddresses.map((addr) => (
                  <SelectItem key={addr.id} value={addr.id || ''}>
                    {addr.first_name} {addr.last_name}, {addr.street}, {addr.postal_code} {addr.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Address form fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${type}-firstName`}>Vorname *</Label>
            <Input
              id={`${type}-firstName`}
              placeholder="Max"
              value={address.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${type}-lastName`}>Nachname *</Label>
            <Input
              id={`${type}-lastName`}
              placeholder="Mustermann"
              value={address.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${type}-street`}>Straße und Hausnummer *</Label>
          <Input
            id={`${type}-street`}
            placeholder="Musterstraße 123"
            value={address.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${type}-street2`}>Adresszusatz (optional)</Label>
          <Input
            id={`${type}-street2`}
            placeholder="Apartment, Etage, etc."
            value={address.street2 || ''}
            onChange={(e) => handleInputChange('street2', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${type}-postalCode`}>PLZ *</Label>
            <Input
              id={`${type}-postalCode`}
              placeholder="12345"
              value={address.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              maxLength={10}
              required
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor={`${type}-city`}>Stadt *</Label>
            <Input
              id={`${type}-city`}
              placeholder="Musterstadt"
              value={address.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${type}-country`}>Land *</Label>
          <Select value={address.country} onValueChange={(value) => handleInputChange('country', value)}>
            <SelectTrigger id={`${type}-country`}>
              <SelectValue placeholder="Land wählen" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
