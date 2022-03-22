type JsonObject<T = {}> = T & { [Key in string]?: JsonValue<T> };
type JsonValue<T> = Array<JsonValue<T>> | JsonObject<T> | boolean | number | string | null;

export const formatServerEvent = (name: string, data: JsonObject): string => {
  return 'event: ' + name + '\ndata: ' + JSON.stringify(data) + '\n\n';
};
