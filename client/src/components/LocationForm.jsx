import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Crosshair,
  MapPin,
  ChevronDown,
  ChevronUp,
  Search,
  Loader2,
  Phone,
  User,
  CheckCircle,
  Navigation,
  X,
} from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { cn } from '../utils/cn';

const DEFAULT_CENTER = [12.9716, 77.5946];

const initialState = {
  name: '',
  latitude: '',
  longitude: '',
  radius: 150,
  contactIds: [],
  message: '',
};
function toFormState(location){
  if(!location) return initialState;
  return {
    name:location.name,
    latitude: String(location.coordinates.latitude),
    longitude: String(location.coordinates.longitude),
    radius:location.radius,
    contactIds : location.contacts.map((c) => c._id || c),
    message : location.message,
  };
}

function PickerEvents({ onPick }) {
  useMapEvents({
    click(event) {
      onPick({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

function RecenterMap({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates.latitude && coordinates.longitude) {
      map.setView([coordinates.latitude, coordinates.longitude], 14, { animate: true });
    }
  }, [coordinates.latitude, coordinates.longitude, map]);

  return null;
}

function LocationPicker({ coordinates, onPick }) {
  const hasCoordinates = Boolean(coordinates.latitude && coordinates.longitude);
  const center = hasCoordinates ? [coordinates.latitude, coordinates.longitude] : DEFAULT_CENTER;

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10">
      <MapContainer center={center} zoom={hasCoordinates ? 14 : 10} scrollWheelZoom className="h-[240px] w-full sm:h-[280px]">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PickerEvents onPick={onPick} />
        <RecenterMap coordinates={coordinates} />
        {hasCoordinates ? (
          <CircleMarker
            center={[coordinates.latitude, coordinates.longitude]}
            radius={10}
            pathOptions={{ color: '#20d3f9', fillColor: '#20d3f9', fillOpacity: 0.85 }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}

function ContactPicker({ contacts, selectedContactIds, onToggle }) {
  const [contactQuery, setContactQuery] = useState('');

  const filteredContacts = contacts.filter((contact) => {
    const query = contactQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      contact.name.toLowerCase().includes(query) ||
      contact.phone.toLowerCase().includes(query)
    );
  });

  const selectedContacts = contacts.filter((contact) => selectedContactIds.includes(contact._id));

  if (contacts.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-[hsl(var(--muted-foreground))]">
        Add a trusted contact on the right before saving this location.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        <Input
          value={contactQuery}
          onChange={(event) => setContactQuery(event.target.value)}
          placeholder="Search contacts by name or number..."
          className="pl-11"
        />
      </div>

      {selectedContacts.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedContacts.map((contact) => (
            <button
              key={contact._id}
              type="button"
              onClick={() => onToggle(contact._id)}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-100"
            >
              {contact.name}
              <X className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
          No contacts selected yet.
        </div>
      )}

      <div className="grid max-h-72 gap-3 overflow-y-auto pr-1">
        {filteredContacts.map((contact) => {
        const isSelected = selectedContactIds.includes(contact._id);

        return (
          <button
            key={contact._id}
            type="button"
            onClick={() => onToggle(contact._id)}
            className={cn(
              'flex w-full items-center justify-between rounded-3xl border px-4 py-4 text-left transition-all',
              isSelected
                ? 'border-cyan-400/60 bg-cyan-400/10 shadow-lg shadow-cyan-500/10'
                : 'border-white/10 bg-black/10 hover:border-white/20 hover:bg-white/5',
            )}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-2">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <Phone className="h-3.5 w-3.5" />
                  {contact.phone}
                </p>
              </div>
            </div>

            {isSelected ? <CheckCircle className="h-5 w-5 text-cyan-300" /> : null}
          </button>
        );
      })}
      </div>

      {filteredContacts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
          No contacts matched your search.
        </div>
      ) : null}
    </div>
  );
}

function LocationForm({ contacts, onSubmit, isSubmitting, initialValues, submitLabel='save location' }) {
  const [form, setForm] = useState(()=> toFormState(initialValues));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSearchId, setSelectedSearchId] = useState(null);


  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const setCoordinates = ({ latitude, longitude }) => {
    setForm((current) => ({
      ...current,
      latitude: String(latitude),
      longitude: String(longitude),
    }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser.');
      return;
    }

    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({
          latitude: Number(coords.latitude.toFixed(6)),
          longitude: Number(coords.longitude.toFixed(6)),
        });
      },
      (error) => {
        setGeoError(error.message || 'Unable to fetch your current location.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
      },
    );
  };

  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 3) {
      setSearchResults([]);
      setSearchError(query.length === 0 ? '' : 'Keep typing to search places.');
      setIsSearching(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchError('');

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
            },
          },
        );

        if (!response.ok) {
          throw new Error('Search request failed.');
        }

        const results = await response.json();

        if (!results.length) {
          setSearchResults([]);
          setSearchError('No matching places found. Try a nearby landmark or broader area.');
          return;
        }

        const normalized = results.map((result) => ({
          id: result.place_id,
          title:
            result.name ||
            result.address?.road ||
            result.address?.suburb ||
            result.address?.city ||
            result.display_name.split(',')[0],
          subtitle: result.display_name,
          latitude: Number(Number(result.lat).toFixed(6)),
          longitude: Number(Number(result.lon).toFixed(6)),
        }));

        setSearchResults(normalized);
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }

        setSearchResults([]);
        setSearchError('Place search is unavailable right now. You can still click on the map.');
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const applySearchResult = (result) => {
    setCoordinates({
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setSearchQuery(result.subtitle);
    setSelectedSearchId(result.id);
    if (!form.name) {
      setForm((current) => ({ ...current, name: result.title }));
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    await onSubmit({
      ...form,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      radius: Number(form.radius),
    });
if(!initialValues){
    setForm(initialState);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
    setSelectedSearchId(null);
    setShowAdvanced(false);
}
  };

  const hasCoordinates = Boolean(form.latitude && form.longitude);

  return (
    <Card className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Safe location setup</p>
          <h2 className="text-2xl font-semibold">Create a new geofence</h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Search a place, click on the map, or use your current location. Raw coordinates are optional.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={handleUseCurrentLocation} className="w-full md:w-auto">
          <Crosshair className="mr-2 h-4 w-4" />
          Use my location
        </Button>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <Input
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSelectedSearchId(null);
            }}
            placeholder="Search home, office, address, landmark..."
            className="pl-11 pr-11"
          />
          {isSearching ? (
            <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[hsl(var(--muted-foreground))]" />
          ) : null}
        </div>

        {searchError ? <p className="text-sm text-rose-300">{searchError}</p> : null}

        {searchResults.length > 0 ? (
          <div className="grid gap-2 rounded-3xl border border-white/10 bg-black/10 p-2">
            {searchResults.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => applySearchResult(result)}
                className={cn(
                  'flex items-start gap-3 rounded-2xl px-4 py-3 text-left transition-all',
                  selectedSearchId === result.id ? 'bg-cyan-400/10' : 'hover:bg-white/5',
                )}
              >
                <div className="mt-0.5 rounded-2xl bg-white/10 p-2">
                  <Navigation className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{result.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-[hsl(var(--muted-foreground))]">{result.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <LocationPicker
        coordinates={{ latitude: Number(form.latitude), longitude: Number(form.longitude) }}
        onPick={setCoordinates}
      />

      <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-cyan-400/15 p-2 text-cyan-200">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{hasCoordinates ? 'Location selected' : 'No location selected yet'}</p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {hasCoordinates
                ? `${Number(form.latitude).toFixed(6)}, ${Number(form.longitude).toFixed(6)}`
                : 'Search, click on the map, or use your current location to set the geofence center.'}
            </p>
            {geoError ? <p className="mt-2 text-sm text-rose-300">{geoError}</p> : null}
          </div>
        </div>
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <label className="space-y-2">
          <span className="text-sm text-[hsl(var(--muted-foreground))]">Location name</span>
          <Input name="name" value={form.name} onChange={handleChange} placeholder="Home" required />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-[hsl(var(--muted-foreground))]">Radius in meters</span>
          <Input name="radius" type="number" min="50" value={form.radius} onChange={handleChange} required />
        </label>

        <div className="space-y-2 md:col-span-2">
          <span className="text-sm text-[hsl(var(--muted-foreground))]">Emergency contact</span>
          <ContactPicker
            contacts={contacts}
            selectedContactIds={form.contactIds}
            onToggle={(contactId) =>
              setForm((current) => ({
                ...current,
                contactIds: current.contactIds.includes(contactId)
                  ? current.contactIds.filter((id) => id !== contactId)
                  : [...current.contactIds, contactId],
              }))
            }
          />
        </div>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm text-[hsl(var(--muted-foreground))]">Custom message</span>
          <Textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Hi Mom, I reached home safely."
            required
          />
        </label>

        <div className="space-y-2 md:col-span-2">
          <span className="text-sm text-[hsl(var(--muted-foreground))]">Preview</span>
          <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-[hsl(var(--muted-foreground))]">
            SafePing will trigger when you enter the selected area and send your custom arrival message.
          </div>
        </div>

        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() => setShowAdvanced((current) => !current)}
            className="mb-4 inline-flex items-center text-sm text-[hsl(var(--muted-foreground))]"
          >
            {showAdvanced ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
            Advanced coordinates
          </button>

          {showAdvanced ? (
            <div className="grid gap-4 rounded-3xl border border-white/10 bg-black/10 p-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">Latitude</span>
                <Input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} required />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">Longitude</span>
                <Input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} required />
              </label>
            </div>
          ) : (
            <>
              <input type="hidden" name="latitude" value={form.latitude} readOnly />
              <input type="hidden" name="longitude" value={form.longitude} readOnly />
            </>
          )}
        </div>

        <div className="md:col-span-2">
          <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || contacts.length === 0 || !hasCoordinates || !form.contactIds.length}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default LocationForm;
