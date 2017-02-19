import { queryExpression as oqe, QueryExpression } from './query-expression';
import { RecordIdentity } from './record';
import { QueryTerm, Records, Record, RelatedRecord, RelatedRecords } from './query-term';

export default {
  records(type: string): Records {
    return new Records(oqe('records', type));
  },

  record(recordIdentity: RecordIdentity): Record {
    return new Record(recordIdentity);
  },

  relatedRecord(record: RecordIdentity, relationship: string): RelatedRecord {
    return new RelatedRecord(record, relationship);
  },

  relatedRecords(record: RecordIdentity, relationship: string): RelatedRecords {
    return new RelatedRecords(record, relationship);
  },

  or(a: any, b: any): QueryExpression {
    return oqe('or', a, b);
  },

  and(a: any, b: any): QueryExpression {
    return oqe('and', a, b);
  }
};
