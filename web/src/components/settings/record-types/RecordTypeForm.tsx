import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RecordTypeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; domain: string }) => void;
  initialData?: { _id: string; name: string; domain: string } | null;
  domains: string[];
}

const RecordTypeForm: React.FC<RecordTypeFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  domains,
}) => {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDomain(initialData.domain);
    } else {
      setName('');
      setDomain('');
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && domain) {
      onSubmit({ name: name.trim(), domain });
      handleClose();
    }
  };

  const handleClose = () => {
    setName('');
    setDomain('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Record Type' : 'Add Record Type'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Mortgage, Rent, Car Loan"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Select
              value={domain}
              onValueChange={setDomain}
              disabled={!!initialData}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a domain" />
              </SelectTrigger>
              <SelectContent>
                {domains.map(d => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordTypeForm;
