import { useEffect, useState } from 'react';
import { Link, useNavigate,useLocation } from 'react-router-dom';
import { MapPin, Plus, Trash2, Users } from 'lucide-react';
import StatCard from '../components/StatCard';
import TrackingControl from '../components/TrackingControl';
import ContactList from '../components/ContactList';
import { Card } from '../components/ui/card';
import { Button, buttonVariants } from '../components/ui/button';
import { locationService } from '../services/locationService';
import { historyService } from '../services/historyService';
import { contactService } from '../services/contactService';
import { useGeolocationTracking } from '../hooks/useGeolocationTracking';
import { useTrackingStore } from '../store/TrackingContext';
import { cn } from '../utils/cn';

function DashboardPage() {
  const [locations, setLocations] = useState([]);
  const [history, setHistory] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { lastEvent } = useTrackingStore();
  const { isTracking, start, stop, error: trackingError } = useGeolocationTracking(locations);
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const selectedLocation = routerLocation.state?.location;

  const loadData = async () => {
    try {
      const [locationsResponse, historyResponse, contactsResponse] = await Promise.all([
        locationService.list(),
        historyService.list(),
        contactService.list(),
      ]);

      setLocations(locationsResponse.locations);
      setHistory(historyResponse.logs);
      setContacts(contactsResponse.contacts);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!lastEvent) {
      return;
    }

    loadData();
  }, [lastEvent]);

  const handleDeleteLocation = async (locationId) => {
    try {
      await locationService.remove(locationId);
      loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete location.');
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await contactService.remove(contactId);
      loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete contact.');
    }
  };

  if (isLoading) {
    return <div className="glass-panel rounded-3xl p-6">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard label="Safe zones" value={locations.length} detail="Saved arrival triggers across your routine." index={0} />
        <StatCard label="Messages sent" value={history.length} detail="Automated arrival confirmations delivered." index={1} />
        <StatCard label="Trusted contacts" value={contacts.length} detail="People who can receive your safe ping." index={2} />
      </section>

      <TrackingControl isTracking={isTracking} onStart={start} onStop={stop} error={trackingError || error} />

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Saved safe locations</p>
              <h2 className="text-2xl font-semibold">Geofence list</h2>
            </div>
            <Link to="/locations/new" className={cn(buttonVariants({ variant: 'default' }), 'shrink-0')}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Link>
          </div>

          <div className="space-y-3">
            {locations.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-black/10 p-6 text-center">
                <MapPin className="mx-auto h-8 w-8 text-cyan-300" />
                <h3 className="mt-4 text-lg font-semibold">No safe locations yet</h3>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                  Add your home, office, campus, or any arrival point you want SafePing to monitor.
                </p>
              </div>
            ) : null}

            {locations.map((location) => (
              <div key={location._id} className="rounded-3xl border border-white/10 bg-black/10 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{location.name}</h3>
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-200">
                        {location.radius}m radius
                      </span>
                    </div>
                    <p className="mt-2 break-words text-sm text-[hsl(var(--muted-foreground))]">
                      {location.coordinates.latitude}, {location.coordinates.longitude}
                    </p>

                    <div className="mt-4 flex items-start gap-2 text-sm">
                      <Users className="mt-0.5 h-4 w-4 text-cyan-300" />
                      <div className="min-w-0">
                        <p className="font-medium">Notifies</p>
                        <p className="break-words text-[hsl(var(--muted-foreground))]">
                          {(location.contacts || []).map((contact) => `${contact.name} - ${contact.phone}`).join(', ')}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
                      {location.message}
                    </p>
                  </div>
                  <Button type="button" size="sm" onClick = {()=>{
                    NavigateEvent('/add-location', {state:{location}});

                  }}
                  >
                    Edit
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteLocation(location._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <ContactList contacts={contacts} onDelete={handleDeleteContact} />
      </section>
    </div>
  );
}

export default DashboardPage;
