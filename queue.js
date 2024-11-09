function doGet(request) {
	const queue_sheet =
		SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
	const action_type = request.parameter.action;
	const user_name = request.parameter.user;
	const channel_name = request.parameter.channel;
	const user_level = request.parameter.userlevel;
	const tip_amount = isNaN(parseFloat(request.parameter.tip))
		? 0
		: parseFloat(request.parameter.tip);
	const queue_data = get_queue_data();

	function create_json_output(data) {
		return ContentService.createTextOutput(
			JSON.stringify(data)
		).setMimeType(ContentService.MimeType.JSON);
	}

	function is_subscriber_or_higher(level) {
		return (
			level === true ||
			level === 'TRUE' ||
			['subscriber', 'moderator', 'owner'].includes(level)
		);
	}

	function get_queue_data() {
		return queue_sheet
			.getDataRange()
			.getValues()
			.slice(1)
			.filter((entry) => entry[0]);
	}

	function sort_queue(entries) {
		return entries.sort((a, b) => {
			const tip_a = parseFloat(a[4]) || 0;
			const tip_b = parseFloat(b[4]) || 0;
			const is_sub_a =
				a[3] === true ||
				a[3] === 'TRUE' ||
				is_subscriber_or_higher(a[3]);
			const is_sub_b =
				b[3] === true ||
				b[3] === 'TRUE' ||
				is_subscriber_or_higher(b[3]);

			if (tip_a >= 6 && tip_b >= 6) return tip_b - tip_a;
			if (tip_a >= 6) return -1;
			if (tip_b >= 6) return 1;
			if (is_sub_a && !is_sub_b) return -1;
			if (!is_sub_a && is_sub_b) return 1;
			if (tip_a > 0 && tip_b > 0) return tip_b - tip_a;
			if (tip_a > 0) return -1;
			if (tip_b > 0) return 1;
			return new Date(a[2]) - new Date(b[2]);
		});
	}

	function queue_info() {
		return create_json_output({
			message: `Queue System: Use !join to enter, !leave to remove yourself, !position to check your place. Sorted by Top Tippers, Subscribers, and join time.`,
		});
	}

	function join_queue() {
		if (queue_data.some((entry) => entry[0] === user_name)) {
			const position =
				sort_queue(queue_data).findIndex(
					(entry) => entry[0] === user_name
				) + 1;
			return create_json_output({
				message: `${user_name}, you're already in the queue at position ${position}!`,
			});
		}

		const is_subscriber = is_subscriber_or_higher(user_level);
		queue_sheet.appendRow([
			user_name,
			channel_name,
			new Date(),
			is_subscriber,
			tip_amount,
		]);
		return create_json_output({
			message: `${user_name} added to queue${
				tip_amount >= 6
					? ' (Top Tipper)'
					: is_subscriber
					? ' (Subscriber)'
					: ''
			}.`,
		});
	}

	function leave_queue() {
		const index = queue_data.findIndex((entry) => entry[0] === user_name);
		if (index < 0)
			return create_json_output({
				message: `${user_name} is not in the queue.`,
			});
		queue_sheet.deleteRow(index + 2);
		return create_json_output({
			message: `${user_name} removed from the queue.`,
		});
	}

	function list_queue() {
		const sorted_queue = sort_queue(queue_data);
		if (!sorted_queue.length)
			return create_json_output({
				message: 'The queue is currently empty.',
			});

		const formatted_queue = sorted_queue
			.map((entry, index) => `${index + 1}. ${entry[0]} (${entry[1]})`)
			.join(', ');
		return create_json_output({
			message: `Current queue: ${formatted_queue}`,
		});
	}

	function check_position() {
		const sorted_queue = sort_queue(queue_data);
		const position = sorted_queue.findIndex(
			(entry) => entry[0] === user_name
		);
		if (position < 0)
			return create_json_output({
				message: `${user_name} is not in the queue.`,
			});
		return create_json_output({
			message: `${user_name}, you are at position ${
				position + 1
			} in the queue.`,
		});
	}

	function status_queue() {
		const sorted_queue = sort_queue(queue_data);
		if (!sorted_queue.length)
			return create_json_output({
				message: 'The queue is currently empty.',
			});

		const next_user = sorted_queue[0][0];
		return create_json_output({
			message: `There are ${queue_data.length} users in the queue. Next up: ${next_user}.`,
		});
	}

	function clear_queue() {
		queue_sheet.clear();
		queue_sheet.appendRow([
			'Username',
			'Channel',
			'Timestamp',
			'Priority',
			'Tip Amount',
		]);
		return create_json_output({ message: 'The queue has been cleared.' });
	}

	function next_user() {
		if (!['moderator', 'owner'].includes(user_level)) {
			return create_json_output({
				error: 'You do not have permission to use this command.',
			});
		}

		const sorted_queue = sort_queue(queue_data);
		if (!sorted_queue.length) {
			return create_json_output({
				message: 'The queue is currently empty.',
			});
		}

		const next_user = sorted_queue.shift();
		queue_sheet
			.getRange(
				2,
				1,
				queue_sheet.getLastRow() - 1,
				queue_sheet.getLastColumn()
			)
			.clear();
		sorted_queue.forEach((entry) => queue_sheet.appendRow(entry));
		const updated_queue = sort_queue(get_queue_data());
		const next_up = updated_queue.length ? updated_queue[0][0] : 'No one';

		return create_json_output({
			message: `Skipped to the next user. Now it's ${next_up}'s turn!`,
		});
	}

	switch (action_type) {
		case 'join':
			return join_queue();
		case 'leave':
			return leave_queue();
		case 'list':
			return list_queue();
		case 'position':
			return check_position();
		case 'status':
			return status_queue();
		case 'clearqueue':
			return ['moderator', 'owner'].includes(user_level)
				? clear_queue()
				: create_json_output({ error: 'You do not have permission.' });
		case 'queueinfo':
			return queue_info();
		case 'next':
			return next_user();
		default:
			return create_json_output({ error: 'Invalid action.' });
	}
}
