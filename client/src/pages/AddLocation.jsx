import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LocationForm from '../components/LocationForm';
import { CheckCircle, Shield } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { contactService } from '../services/contactService';
import { locationService } from '../services/locationService';

function AddLocationPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [contactForm, setContactForm] = useState({ name: '', phone: '' });
  const [error, setError] = useState('');
  const [isSubmittingLocation, setIsSubmittingLocation] = useState(false);
  const [editingContactId, setEditingContactId] = useState(null);
  const routeLocation = useLocation();
  useEffect(()=>{
    const contact = routeLocation.state?.editContact;
    if(contact){
      setEditingContactId(contact._id);
      setContactForm({name:contact.name, phone:contact.phone});
    }
  },[routeLocation.state])

  const loadContacts = async () => {
    const response = await contactService.list();
    setContacts(response.contacts);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const createContact = async (event) => {
    event.preventDefault();
    try {
      setError('');
      if(editingContactId) await contactService.update(editingContactId, contactForm);
      else await contactService.create(contactForm);
      setEditingContactId(null);
      setContactForm({ name: '', phone: '' });
      loadContacts();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save contact.');
    }
  };

  const createLocation = async (payload) => {
    try {
      setIsSubmittingLocation(true);
      setError('');
      await locationService.create(payload);
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save location.');
    } finally {
      setIsSubmittingLocation(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <LocationForm contacts={contacts} onSubmit={createLocation} isSubmitting={isSubmittingLocation} />

      <Card className="space-y-6">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Emergency contact list</p>
          <h2 className="mt-2 text-2xl font-semibold">Add a trusted recipient</h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Save people you trust so each safe location can notify one or more contacts instantly.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Saved contacts</p>
            <p className="mt-1 text-2xl font-semibold">{contacts.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Format tip</p>
            <p className="mt-1 text-sm font-medium">Use E.164 format like `+15551234567`</p>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={createContact}>
          <label className="block space-y-2">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">Contact name</span>
            <Input
              value={contactForm.name}
              onChange={(event) => setContactForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">Phone number</span>
            <Input
              value={contactForm.phone}
              onChange={(event) => setContactForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder="+15551234567"
              required
            />
          </label>
          <Button type="submit" className="w-full sm:w-auto">{editingContactId ? 'Save changes' : 'Save contact'}</Button>
        </form>

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        <div className="mt-6 space-y-3">
          {contacts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/10 p-6 text-center">
              <Shield className="mx-auto h-8 w-8 text-cyan-300" />
              <h3 className="mt-4 text-lg font-semibold">No contacts saved yet</h3>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                Add at least one trusted person before you create a safe location.
              </p>
            </div>
          ) : null}

          {contacts.map((contact) => (
            <div key={contact._id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{contact.name}</p>
                <p className="truncate text-sm text-[hsl(var(--muted-foreground))]">{contact.phone}</p>
              </div>
              <div className='flex justify-center align-center gap-3'>
              <Button type="button" size="sm"
              onClick={()=>{setEditingContactId(contact._id); setContactForm({name:contact.name, phone:contact.phone});}} >
                Edit
              </Button>
              <CheckCircle className="h-5 w-5 text-cyan-300" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default AddLocationPage;
