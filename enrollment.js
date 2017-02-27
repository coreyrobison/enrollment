/**
 * Created by tonymucci on 1/12/17.
 */

$(document).ready(function () {

    /* Enable Jquery Form Vaildation */
    //var parsley = $('#enrollment_form').parsley();

    /* Navigation */
    $('nav > div>  ul > li').on('click', function () {
        var valid_inputs = validateInputs($(this));
        var valid_inputs = true; //TODO Remove when ready for Prod

        if (!valid_inputs) {
            return false;
        } else {

            if ($(this).attr('data-step-nav') == 2) {
                $('#new_plan_title').html("Well Done " + $('#first_name').val() + "! <br>Let's choose your plan.")
                //Send Free User Data
                $.post('/signup/savestep1', {'first_name' : $('#first_name').val(), 'last_name' : $('#last_name').val(), 'email' : $('#email_address').val()}, function (data) {

                    /*Save Metrics to Zaius */
                    zaius.event('enrollment_step_1', {
                        action   : "newsletter_signup",
                        category : "Enrollment > Step 1",
                        title    : 'Enrollment - Step 1'
                    });
                    var json = JSON.parse(data);
                    $('#user_id').val(json.user_id);
                    $('.member-card-valid-date').text(json.card_end_date);
                    $('.member-card-number').text(json.member_id);
                })
            } else if ($(this).attr('data-step-nav') == 4) {
                //Send Free User Data
                $.post('/signup/savestep3', {'family_members' : 'test'}, function (data) {

                    /*Save Metrics to Zaius */
                    zaius.event('enrollment_step_1', {
                        action   : "newsletter_signup",
                        category : "Enrollment > Step 1",
                        title    : 'Enrollment - Step 1'
                    });
                    var json = JSON.parse(data);
                    $('#user_id').val(json.user_id);
                    $('.member-card-valid-date').text(json.card_end_date);
                    $('.member-card-number').text(json.member_id);
                })
            }
            nextStep($(this));
        }

    });

    /*Go To Next Step and Validate Current Information */

    $('.va-btn-primary').on('click', function () {
        var new_step = $(this).attr('data-step');

        $('li[data-step-nav="' + new_step + '"]').click();
    });

    /* Select Plans */
    $('.plan-rectangle').on('click', function () {
        $('.plan-rectangle').removeClass(('plan-rectangle-active'));
        $(this).addClass('plan-rectangle-active');
        $('#plan_length_value').val($(this).attr('data-plan-length'));

        /*Add To Summary. This can't be included in the normal way of updating the summary, because of the way the input[type=hidden] works.*/
        $('.plan_length_summary').text($(this).attr('data-plan-length'));

        /*Change Ribbon Color */
        $('.plan-rectangle .box > div').removeClass('ribbon-active').addClass('ribbon');
        $('.plan-rectangle-active .box > div').removeClass('ribbon').addClass('ribbon-active');
    });

    /* Add new Member */
    $('#add_new_family_button').on('click', function () {
        /*Save Metrics to Zaius */
        zaius.event('enrollment_step_3', {
            action   : "Added Family Member",
            category : "Enrollment > Step 3",
            title    : 'Enrollment - Step 3'
        });

        var new_num = parseInt($('#family_member_container > div:last').attr('data-fam-num')) + 1;
        var new_row = $('#family_member_container > div:last').clone().appendTo('#family_member_container');
        $(new_row).attr('data-fam-num', new_num);
        $('#family_member_container > div:last > div').children('select').attr('name', 'family_member[' + new_num + ']["first_name"]');
        $('#family_member_container > div:last > div > input[data-fam-type="family_first_name"]').attr('name', 'family_member[' + new_num + ']["family_first_name"]');
        $('#family_member_container > div:last > div > input[data-fam-type="family_last_name"]').attr('name', 'family_member[' + new_num + ']["family_last_name"]');
        $('#family_member_container > div:last > div > input[data-fam-type="family_email"]').attr('name', 'family_member[' + new_num + ']["family_email"]');

        /* Disable if There are 4 fams already */
        if ($('#family_member_container > div').length == 4) {
            $('#add_new_family_button').attr('disabled', 'disabled');
            return false;
        }

    });

    /* Same As Billing Clone */
    $('#address_shipping_match').on('click', function () {
        var address = ['street_address', 'apt_number', 'city', 'zip_code', 'payment_state', 'payment_country'];

        for (var i = 0; i < address.length; i++) {
            $('#shipping_' + address[i]).val($('#' + address[i]).val());
        }
    });

    /* Two CC Cards */
    $('#cc_two_card').on('click', function () {
        $('#card_two').slideDown('slow');
    });
    $('#cc_one_card').on('click', function () {
        $('#card_two').slideUp('fast');
    });

    /* Name on Card */
    $('#first_name,#last_name').on('keyup', function () {
        $('#member_card_name').text($('#first_name').val() + ' ' + $('#last_name').val());
    });

    /* Summary */
    $('input,select').on('click change keyup', function () {

        if ($(this).is('select')) {
            var data = $(this).children('option:selected').text();
        }
        else {

            var data = $(this).attr('data-summary-text') ? $(this).attr('data-summary-text') : $(this).val();
        }

        if ($(this).attr('data-summary-id')) {
            $('#' + $(this).attr('data-summary-id')).text(data);
        } else if ($(this).attr('data-summary-class')) {
            $('.' + $(this).attr('data-summary-class')).text(data);
        }

    });

    /* Show Donation Counter */

    $('#yes_donation').on('click', function () {
        $('.wounded-vet-counter-container').slideDown();
    });
    /* Show Donation Counter */

    $('#no_donation').on('click', function () {
        $('.wounded-vet-counter-container').slideUp();
    });

    /*Control Counter for Wounded Vet input*/
    $('#increase_counter,#decrease_counter').on('click', function () {
        var old_val = $('#donation_amount').val().length == 0 ? 0 : $('#donation_amount').val();

        /*Disables Negative Numbers */
        if (old_val == 0 && $(this).attr('id') == 'decrease_counter') {
            return false;
        }
        // var new_val = $(this).attr('data-change') == 'add' ? ++old_val : --old_val;
        var new_val = $(this).attr('data-change') == 'add' ? parseInt(old_val) + 10 : parseInt(old_val) - 10;
        $('#donation_amount').val(new_val);

    });

    resizeCardFont();

})
;

$(window).on('resize', function () {
    resizeCardFont();
});

/**
 * Resize the Font for the member card on the sidebar when the screen is loaded and/or on window.resize
 */
function resizeCardFont() {
    /* Resize Member name and Card Valid Date on Card Load */
    var member_card_width  = $('.member-card-image').width();
    var member_card_height = $('.member-card-image').height();

    $('.member-card-name').css('font-size', member_card_width / 14);
    $('.member-card-number').css('font-size', member_card_width / 16);
    $('.member-card-valid-date').css('font-size', member_card_width / 16);

}

/**
 * This function is built for the one page app. It allows you to hide each step of the enrollment and
 * @param element
 * @returns {boolean}
 */
function nextStep(element) {
    /* Scroll To Top*/

    $('body').scrollTop(0);

    var old_step = $('.active').attr('data-step-nav');
    var new_step = element.attr('data-step-nav');

    /*Save Metrics to Zaius */
    zaius.event('enrollment_step_' + old_step, {
        action   : "completed_step",
        category : "Enrollment > Step " + old_step,
        title    : 'Enrollment - Step ' + old_step
    });

    /*Save Metrics to Zaius */
    zaius.event('enrollment_step_' + new_step, {
        action   : "new_step",
        category : "Enrollment > Step " + new_step,
        title    : 'Enrollment - Step ' + new_step
    });

    if (!element.attr('data-step-nav')) {
        return false;
    }
    else {
        $('div[data-step]').each(function () {
            if ($(this).attr('data-step') !== new_step) {

                /*Make sure unwanted content stays hidden */
                $(this).addClass('step-off');
            }
            else {

                /* Set Complete Circle */
                $('li.active > div').removeClass('nav-active-container').addClass('completed-step-container');
                $('li.active span').removeClass('nav-active-circle').addClass('completed-step').text('');

                /*Set Active Circle */
                $('li.active > div').removeClass('completed-step-container').addClass('nav-active-container');
                $('li.active span').removeClass('nav-active-circle');
                $('li[data-step-nav="' + new_step + '"] span').removeClass('completed-step').addClass('nav-active-circle').text(new_step);

                /* Set Active Nav Line */
                $('li.active').removeClass('active');
                $('li[data-step-nav="' + new_step + '"]').addClass('active');

                /*Show Content */
                $(this).addClass('step-on').removeClass('step-off');

                /* Show Summary */

                /*Skip Family if no members are entered in the inputs*/
                if (old_step == 3) {
                    if ($('#family_member_container input')[0].value.toString().length == 0) {
                        return true;
                    }
                } else {

                    $('.summary-content[data-summary-step="' + old_step + '"]').fadeIn();
                }
            }
        });

    }
}

function validateInputs(element) {
    var old_step = $('.active').attr('data-step-nav');

    /* Validate Data */
    var inputs  = $('div[data-step="' + old_step + '"] input[required],div[data-step="' + old_step + '"] select[required]');
    var proceed = true;
    inputs.each(function () {
        var input = $('#' + $(this).attr('id'));
        if (input.val().toString().length == 0) {

            $(this).parent().addClass('has-error');
            if ($(this).siblings('.dynamic-error-message').length == 0) {
                $(this).after('<div class="dynamic-error-message danger"><strong>This is a required field</strong></div>');
            }
            proceed = false;
        } else {
            $(this).siblings('.dynamic-error-message').remove();
            $(this).parent().removeClass('has-error');
        }
    });

    if (proceed) {

        return true;
    } else {
        /*Save Metrics to Zaius */
        zaius.event('enrollment_step_' + old_step, {
            action   : "failed_form_validation",
            category : "Enrollment > Step " + old_step,
            title    : 'Enrollment - Step ' + old_step
        });

        return false;
    }
}
