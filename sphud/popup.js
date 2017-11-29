
function saveNotes() {
    var notes = $('#notes').val();
    chrome.storage.local.set({'notes': notes}, function() {
        message('Settings saved');
    });
}
  
function loadNotes() {
    chrome.storage.local.get('notes', function (items) {
        $('#notes').val(items.notes);
    });
}

function loadEnabled() {
    chrome.storage.local.get('sphudEnabled', function (items) {
        if (items.sphudEnabled)
            $('#sphud-enabled').click();
    });
}


$('#kb-search').focus();
loadNotes();
loadEnabled();

$('#kb-search').keypress(function (e) {
    if (e.which == 13) {
        window.open('https://support.americommerce.com/hc/en-us/search?query=' + $('#kb-search').val());
    return false;    //<---- Add this line
    }
});

$('#notes').keyup(function (e) {
    saveNotes();
});

$('#sphud-enabled').click(function () {
    var enabled = $('#sphud-enabled').is(':checked');
    chrome.storage.local.set({'sphudEnabled': enabled});
});