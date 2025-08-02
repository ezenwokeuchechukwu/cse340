// utilities/invManagement.js

function buildClassificationList(data) {
  let list = '<select id="classificationList" name="classification_id">';
  list += '<option value="">Choose a Classification</option>';
  data.rows.forEach((row) => {
    list += `<option value="${row.classification_id}">${row.classification_name}</option>`;
  });
  list += '</select>';
  return list;
}

module.exports = { buildClassificationList };
