import { Trash2, User } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {useState} from 'react';
import { Input } from './ui/input';
import { useNavigate } from 'react-router-dom';

function ContactList({ contacts, onDelete }) {
  const navigate = useNavigate();
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Emergency contacts</p>
          <h3 className="text-xl font-semibold">Ready to notify</h3>
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{contacts.length} contacts</p>
      </div>

      <div className="mt-4 space-y-3">
        {contacts.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Add a trusted contact before creating a safe location.</p>
        ) : null}

        {contacts.map((contact) => (
          <div
            key={contact._id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-2">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{contact.name}</p>
                <p className="truncate text-sm text-[hsl(var(--muted-foreground))]">{contact.phone}</p>
              </div>
            </div>
            <div>
            <Button type="button" size="sm"
              onClick={()=>navigate('/locations/new', {state:{editContact : contact}})} >
                Edit
              </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(contact._id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default ContactList;
