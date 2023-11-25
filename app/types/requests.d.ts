export interface Message {
	type: string,
	payload: any,
}

export interface SheetIngestionMessage extends Message {
	type: 'sheet-ingestion',
	payload: string,
}
