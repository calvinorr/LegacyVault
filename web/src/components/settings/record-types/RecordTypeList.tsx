import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface RecordType {
  _id: string;
  name: string;
  domain: string;
}

interface RecordTypeListProps {
  domain: string;
  recordTypes: RecordType[];
  onEdit: (recordType: RecordType) => void;
  onDelete: (id: string) => void;
}

const RecordTypeList: React.FC<RecordTypeListProps> = ({ domain, recordTypes, onEdit, onDelete }) => {
  return (
    <div>
      <h4 className="font-medium text-base mb-3">{domain}</h4>
      {recordTypes.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No record types defined</p>
      ) : (
        <div className="space-y-2">
          {recordTypes.map(recordType => (
            <div
              key={recordType._id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="text-sm">{recordType.name}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(recordType)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(recordType._id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordTypeList;
