export interface AccessData {
    userId: string;
    dateAccessed: string;
    timeAccessed: string;
    url: string;
    timeSpent: number;
  }
  
export interface AggregatedData {
    month: string;
    averageTimeSpent: number;
}
  