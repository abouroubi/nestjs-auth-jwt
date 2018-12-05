export function GetOperationId(model: string, operation: string) {
  const _model = toTitleCase(model).replace(/\s/g, '');
  const _operation = toTitleCase(operation).replace(/\s/g, '');

  return {
    title: '',
    operationId: `${_model}_${_operation}`,
  };
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word[0].toUpperCase() + word.substr(1))
    .join(' ');
}
