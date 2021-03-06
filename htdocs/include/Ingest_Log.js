//<!--
// --------------------------------------------------------------------------------------
// Copyright 2017,2018 Scott Ross
// This file is part of CC-Plus.
//
// CC-Plus is free software: you can redistribute it and/or modify it under the terms
// of the GNU General Public License as published by the Free Software Foundation,
// either version 3 of the License, or (at your option) any later version.
//
// CC-Plus is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
// without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
// PURPOSE.  See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with CC-Plus.
// If not, see <http://www.gnu.org/licenses/>.
// --------------------------------------------------------------------------------------
//////// Ingest Log Viewer Javascript functions       ////////
$(document).ready(function() {

  // Init table sorter
  //
  $(document).ready(function() { $('table').tablesorter(); });

  //////// This fires on changes to the form inputs  ////////
  //////// and queries for the data rows in the page ////////
  $("[id^=filter_]").change(function () {
    var $table = $('#data_table');
    $.tablesorter.clearTableBody( $table );
    var form_data = $(this).closest('form').serialize();
    form_data['ajax'] = 1;
    var _my_url = window.location.pathname.substring(window.location.pathname.lastIndexOf("/")+1);
    $.ajax({
      url: "ingest_log_js.php",
      type: 'POST',
      data: form_data,
      dataType: 'json',
      success: function(return_data) {
        var mgr = return_data.manager;
        $.each(return_data.records, function(key,value){
          if (typeof value.error === 'undefined' || !value.error) {
            //
            // Build new table rows from function output 
            //
            var row="<tr>";
            row += "<td align='left'>"+value.prov_name+"</td>";
            row += "<td align='left'>"+value.inst_name+"</td>";
            row += "<td align='center'>";
            if ( mgr && value.status=="Saved") {
              row += "<a href='ReportDetail.php?R_Prov="+value.prov_id+"&R_Inst=";
              row += value.inst_id+"&R_yearmon="+value.yearmon+"&R_report=";
              row += value.ID+"'>"+value.report_name+"</a></td>";
            } else {
              row += value.report_name+"</td>";
            }
            row += "<td align='center'>"+value.yearmon+"</td>";
            row += "<td align='center'";
            if ( value.status == "Saved" ) {
              row += " class=\"ing_succ\">Saved</td>\n";
            } else if ( value.status == "Failed" ) {
              row += " class=\"ing_fail\" FID=\""+value.failed_ID+"\">Failed</td>\n";
            } else if ( value.status == "Deleted" ) {
              row += " class=\"ing_dele\">Deleted</td>\n";
            } else {
              row += ">&nbsp;</td>\n";
            }
            row += "<td align='center'>"+value.timestamp.substr(0,10)+"</td>";
            row += "</tr>";
          } else {
            var row="<tr><td colspan=5 align='center'><p><strong>";
            row += value.message +"</strong></p></td></tr>";
          }
          $table
            .append(row)
            .trigger('update');
        })
      }
    });
  })

  // Mouseover details popup for failed ingest attempts
  // Pulls detail from database and puts in a popup
  //
  $("body").on("mouseover", "td[FID]", function(event) {
    var $this = $(this);
    var failed_ID = $this.attr('FID');
    $this.qtip({
      content: {
        text: 'Loading...',
        ajax: {
          url: 'failed_detail_js.php',
          type: 'POST',
          data: { ID: failed_ID },
          dataType: 'json',
          success: function(return_data,status) {
            if (typeof return_data.error === 'undefined' || !return_data.error) {
              this.set('content.text', return_data.detail);
            } else {
              this.set('content.text', "Error! : "+return_data.message);
            }
          }
        }
      },
      position: {
        at: 'bottom right',
        my: 'bottom center'
      },
      show: {
        event: event.type,
        ready: true
      },
      hide: {
        fixed: true
      }
    }, event);
  });

})
//-->
